import { Injectable } from '@nestjs/common';
import { GitChangeType } from './git-commit-file.entity';

export interface ParsedCommitFile { relativePath: string; previousPath: string | null; changeType: GitChangeType; insertions: number | null; deletions: number | null }
export interface ParsedCommit {
  hash: string; shortHash: string; authorName: string; authorEmail: string | null; authoredAt: Date;
  committerName: string | null; committerEmail: string | null; committedAt: Date; subject: string; body: string | null;
  parentHashes: string[]; branchNames: string[]; tagNames: string[]; files: ParsedCommitFile[];
}

@Injectable()
export class GitParserService {
  parseLog(output: string): ParsedCommit[] {
    return output.split('\x1e').slice(1).map((record) => {
      const fields = record.trimStart().split('\x1f');
      if (fields.length < 12 || !/^[0-9a-f]{40}$/i.test(fields[0] ?? '')) throw new Error('Git returned malformed history data.');
      const [refsLine = '', ...statLines] = (fields[11] ?? '').split('\n');
      const refs = refsLine.split(',').map((ref) => ref.trim()).filter(Boolean);
      const files = statLines.map((line) => this.parseNumstat(line)).filter((file): file is ParsedCommitFile => file !== null);
      return {
        hash: fields[0]!, shortHash: fields[1]!, authorName: fields[2]!, authorEmail: fields[3] || null,
        authoredAt: new Date(fields[4]!), committerName: fields[5] || null, committerEmail: fields[6] || null,
        committedAt: new Date(fields[7]!), subject: fields[8]!, body: fields[9]?.trim() || null,
        parentHashes: fields[10]?.split(' ').filter(Boolean) ?? [],
        branchNames: refs.filter((ref) => !ref.startsWith('tag:')).map((ref) => ref.replace(/^HEAD -> /, '')),
        tagNames: refs.filter((ref) => ref.startsWith('tag:')).map((ref) => ref.slice(4).trim()), files,
      };
    });
  }

  parseNumstat(line: string): ParsedCommitFile | null {
    const [added, removed, relativePath] = line.split('\t');
    if (!relativePath || added === undefined || removed === undefined) return null;
    const rename = this.parseRename(relativePath);
    return {
      relativePath: rename?.current ?? relativePath, previousPath: rename?.previous ?? null, changeType: rename ? GitChangeType.RENAMED : GitChangeType.MODIFIED,
      insertions: added === '-' ? null : Number(added), deletions: removed === '-' ? null : Number(removed),
    };
  }

  private parseRename(path:string):{previous:string;current:string}|null {
    const braced=path.match(/^(.*)\{(.+) => (.+)\}(.*)$/);
    if(braced)return{previous:`${braced[1]}${braced[2]}${braced[4]}`,current:`${braced[1]}${braced[3]}${braced[4]}`};
    const plain=path.match(/^(.+) => (.+)$/);
    return plain?{previous:plain[1]!,current:plain[2]!}:null;
  }
}
