import{Transform}from'class-transformer';import{IsOptional,IsString,MaxLength,MinLength}from'class-validator';
export class CreateSessionDto{@Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value)@IsString()@MinLength(1)@MaxLength(200)title:string;@IsOptional()@IsString()@MaxLength(5000)summary?:string;@IsOptional()@IsString()@MaxLength(300)branchName?:string}
export class UpdateSessionDto{@IsOptional()@IsString()@MinLength(1)@MaxLength(200)title?:string;@IsOptional()@IsString()@MaxLength(5000)summary?:string}
