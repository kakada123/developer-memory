import{Body,Controller,Delete,Get,HttpCode,HttpStatus,Param,ParseUUIDPipe,Post,Query}from'@nestjs/common';import{GitSyncService}from'./git-sync.service';import{GitHistoryService}from'./git-history.service';import{CommitQueryDto}from'./dto/commit-query.dto';import{GitBranchService}from'./git-branch.service';import{SwitchBranchDto}from'./dto/switch-branch.dto';
@Controller('projects/:projectId')export class GitController{constructor(private readonly sync:GitSyncService,private readonly history:GitHistoryService,private readonly branches:GitBranchService){}
 @Post('git/sync')@HttpCode(HttpStatus.ACCEPTED)start(@Param('projectId',new ParseUUIDPipe())id:string){return this.sync.start(id)}
 @Get('git/status')status(@Param('projectId',new ParseUUIDPipe())id:string){return this.sync.status(id)}
 @Delete('git/history')@HttpCode(204)clear(@Param('projectId',new ParseUUIDPipe())id:string){return this.sync.clear(id)}
 @Get('git/branches')listBranches(@Param('projectId',new ParseUUIDPipe())id:string){return this.branches.list(id)}
 @Post('git/branches/refresh')refreshBranches(@Param('projectId',new ParseUUIDPipe())id:string){return this.branches.refresh(id)}
 @Post('git/switch')switchBranch(@Param('projectId',new ParseUUIDPipe())id:string,@Body()input:SwitchBranchDto){return this.branches.switch(id,input.branch)}
 @Get('commits')list(@Param('projectId',new ParseUUIDPipe())id:string,@Query()q:CommitQueryDto){return this.history.list(id,q)}
 @Get('commits/:commitId')one(@Param('projectId',new ParseUUIDPipe())id:string,@Param('commitId',new ParseUUIDPipe())commitId:string){return this.history.one(id,commitId)}
 @Get('commits/:commitId/files')files(@Param('projectId',new ParseUUIDPipe())id:string,@Param('commitId',new ParseUUIDPipe())commitId:string){return this.history.files(id,commitId)} }
