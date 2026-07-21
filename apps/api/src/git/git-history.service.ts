import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';import {Repository}from'typeorm';
import {GitCommit}from'./git-commit.entity';import{GitRepositoryService}from'./git-repository.service';import type{CommitQueryDto}from'./dto/commit-query.dto';
@Injectable() export class GitHistoryService{
 constructor(@InjectRepository(GitCommit)private readonly commits:Repository<GitCommit>,private readonly repository:GitRepositoryService){}
 async list(projectId:string,q:CommitQueryDto){const builder=this.commits.createQueryBuilder('commit').leftJoin('commit.files','file').where('commit.projectId=:projectId',{projectId});
  if(q.search)builder.andWhere('(commit.subject LIKE :search OR commit.body LIKE :search OR commit.authorName LIKE :search OR commit.hash LIKE :search OR file.relativePath LIKE :search)',{search:`%${q.search}%`});
  if(q.author)builder.andWhere('commit.authorName LIKE :author',{author:`%${q.author}%`});if(q.dateFrom)builder.andWhere('commit.committedAt>=:from',{from:q.dateFrom});if(q.dateTo)builder.andWhere('commit.committedAt<=:to',{to:q.dateTo});if(q.filePath)builder.andWhere('file.relativePath LIKE :path',{path:`%${q.filePath}%`});
  const [items,total]=await builder.select(['commit.id','commit.hash','commit.shortHash','commit.authorName','commit.committedAt','commit.subject','commit.filesChanged','commit.insertions','commit.deletions']).distinct(true).orderBy('commit.committedAt','DESC').skip((q.page-1)*q.limit).take(q.limit).getManyAndCount();return{items,total,page:q.page,limit:q.limit};}
 async one(projectId:string,id:string){const value=await this.commits.findOneBy({id,projectId});if(!value)throw new NotFoundException('Commit was not found');return value;}
 async files(projectId:string,id:string){await this.one(projectId,id);return this.repository.listFiles(id,projectId);}
}
