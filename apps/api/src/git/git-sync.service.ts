import { ConflictException, Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, GitSyncStatus } from '../projects/project.entity';
import { GitCommandService } from './git-command.service';
import { GitParserService } from './git-parser.service';
import { GitProgressService } from './git-progress.service';
import { GitRepositoryService } from './git-repository.service';

export interface GitSyncResult {projectId:string;status:'SYNCED';newCommits:number;existingCommits:number;changedFiles:number;headHash:string;currentBranch:string|null;durationMs:number;rebuilt:boolean}
const historyLimit=Number(process.env.GIT_HISTORY_LIMIT)||2000;
@Injectable()
export class GitSyncService implements OnModuleInit {
  private readonly logger=new Logger(GitSyncService.name);
  private readonly results=new Map<string,GitSyncResult>();
  constructor(@InjectRepository(Project) private readonly projects:Repository<Project>,private readonly commands:GitCommandService,private readonly parser:GitParserService,private readonly repository:GitRepositoryService,private readonly progress:GitProgressService){}
  async onModuleInit():Promise<void>{await this.projects.update({gitSyncStatus:GitSyncStatus.SYNCING},{gitSyncStatus:GitSyncStatus.FAILED,gitSyncError:'Git synchronization was interrupted. Please try again.'});}
  async start(projectId:string){
    if(this.progress.isActive(projectId)) throw new ConflictException('Git synchronization is already active');
    const project=await this.projects.findOneBy({id:projectId}); if(!project) throw new NotFoundException('Project was not found');
    this.progress.set({projectId,status:'VALIDATING',processedCommits:0,totalCommits:0,percentage:0,message:'Validating Git repository…'});
    await this.projects.update(projectId,{gitSyncStatus:GitSyncStatus.SYNCING,gitSyncError:null});
    void this.run(project).catch(()=>this.logger.error('An unhandled Git synchronization error occurred'));
    return this.progress.get(projectId);
  }
  async status(projectId:string){const project=await this.projects.findOneBy({id:projectId});if(!project)throw new NotFoundException('Project was not found');return{project,progress:this.progress.get(projectId),result:this.results.get(projectId)??null};}
  async clear(projectId:string):Promise<void>{if(this.progress.isActive(projectId))throw new ConflictException('Git synchronization is active');if(!await this.projects.existsBy({id:projectId}))throw new NotFoundException('Project was not found');await this.repository.clear(projectId);await this.projects.update(projectId,{gitSyncStatus:GitSyncStatus.NOT_SYNCED,lastGitSyncedAt:null,gitCommitCount:0,gitHeadHash:null,gitCurrentBranch:null,gitSyncError:null});this.progress.clear(projectId);this.results.delete(projectId);}
  private async run(project:Project):Promise<void>{const started=Date.now();try{
    await this.commands.validateRepository(project.path);const [head,branch,existingCommits]=await Promise.all([this.commands.head(project.path),this.commands.branch(project.path),this.repository.count(project.id)]);
    let rebuilt=false; if(project.gitHeadHash&&!await this.commands.isAncestor(project.path,project.gitHeadHash,head))rebuilt=true;
    this.progress.update(project.id,{status:'READING_COMMITS',percentage:15,message:'Reading commit history…'});
    const output=await this.commands.log(project.path,historyLimit);const commits=this.parser.parseLog(output);
    this.progress.update(project.id,{status:'SAVING',totalCommits:commits.length,processedCommits:commits.length,percentage:75,currentCommit:commits[0]?.shortHash,message:'Saving commit history…'});
    const imported=await this.repository.replaceOrAdd(project.id,commits,rebuilt);const count=await this.repository.count(project.id);const now=new Date();
    await this.projects.update(project.id,{gitSyncStatus:GitSyncStatus.SYNCED,lastGitSyncedAt:now,gitCommitCount:count,gitCurrentBranch:branch||null,gitHeadHash:head,gitSyncError:null});
    const result:GitSyncResult={projectId:project.id,status:'SYNCED',newCommits:imported.newCommits,existingCommits:rebuilt?0:existingCommits,changedFiles:imported.changedFiles,headHash:head,currentBranch:branch||null,durationMs:Date.now()-started,rebuilt};this.results.set(project.id,result);this.progress.update(project.id,{status:'COMPLETED',percentage:100,currentCommit:head.slice(0,8),message:rebuilt?'History rebuilt successfully.':'Git history synchronized.'});
  }catch(error:unknown){const message=error instanceof Error&&['Git is not installed or is unavailable.','The project directory is unavailable.','The project folder is not the root of a Git repository.'].includes(error.message)?error.message:'Git synchronization failed. Verify the repository and try again.';await this.projects.update(project.id,{gitSyncStatus:GitSyncStatus.FAILED,gitSyncError:message}).catch(()=>this.logger.error('Could not persist Git failure status'));this.progress.update(project.id,{status:'FAILED',message});}}
}
