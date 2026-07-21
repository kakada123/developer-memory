import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class CommitQueryDto {
  @Type(()=>Number) @IsInt() @Min(1) page=1;
  @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit=25;
  @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @MaxLength(200) search?:string;
  @IsOptional() @IsString() @MaxLength(200) author?:string;
  @IsOptional() @IsDateString() dateFrom?:string;
  @IsOptional() @IsDateString() dateTo?:string;
  @IsOptional() @IsString() @MaxLength(1000) filePath?:string;
}
