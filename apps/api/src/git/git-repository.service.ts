import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GitCommit } from './git-commit.entity';
import { GitCommitFile } from './git-commit-file.entity';
import type { ParsedCommit } from './git-parser.service';

@Injectable()
export class GitRepositoryService {
  constructor(@InjectRepository(GitCommit) private readonly commits:Repository<GitCommit>, @InjectRepository(GitCommitFile) private readonly files:Repository<GitCommitFile>, private readonly dataSource:DataSource) {}
  count(projectId:string):Promise<number>{ return this.commits.countBy({projectId}); }
  newest(projectId:string):Promise<GitCommit|null>{ return this.commits.findOne({where:{projectId},order:{committedAt:'DESC'}}); }
  exists(projectId:string,hash:string):Promise<boolean>{ return this.commits.existsBy({projectId,hash}); }
  async replaceOrAdd(projectId:string, parsed:ParsedCommit[], rebuild:boolean):Promise<{changedFiles:number;newCommits:number}>{
    return this.dataSource.transaction(async manager=>{
      if(rebuild) await manager.delete(GitCommit,{projectId});
      const existingHashes=new Set(rebuild?[]:(await manager.find(GitCommit,{where:{projectId},select:['hash']})).map(commit=>commit.hash));
      let changedFiles=0;
      let newCommits=0;
      for(let offset=0;offset<parsed.length;offset+=100){
        for(const item of parsed.slice(offset,offset+100)){
          if(existingHashes.has(item.hash)) continue;
          const {files,...metadata}=item;
          const commit=await manager.save(GitCommit,manager.create(GitCommit,{...metadata,projectId,filesChanged:files.length,insertions:files.reduce((n,f)=>n+(f.insertions??0),0),deletions:files.reduce((n,f)=>n+(f.deletions??0),0)}));
          if(files.length) await manager.save(GitCommitFile,files.map(file=>manager.create(GitCommitFile,{...file,projectId,commitId:commit.id})),{chunk:100});
          changedFiles+=files.length;
          newCommits+=1;
          existingHashes.add(item.hash);
        }
      }
      return {changedFiles,newCommits};
    });
  }
  clear(projectId:string):Promise<unknown>{ return this.commits.delete({projectId}); }
  listFiles(commitId:string,projectId:string):Promise<GitCommitFile[]>{return this.files.find({where:{commitId,projectId},order:{relativePath:'ASC'}});}
}
