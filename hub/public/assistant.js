import {WORD_LIMIT,MAX_INPUT_CHARACTERS,countWords} from './ai-limits.js';
const node=(tag,cls='',text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e;};
function inline(parent,text){
 const pattern=/(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;let last=0;
 for(const m of text.matchAll(pattern)){parent.append(document.createTextNode(text.slice(last,m.index)));if(m[2])parent.append(node('strong','',m[2]));else if(m[3])parent.append(node('code','',m[3]));else{const a=node('a','',m[4]);a.href=m[5];a.target='_blank';a.rel='noopener noreferrer';parent.append(a);}last=m.index+m[0].length;}
 parent.append(document.createTextNode(text.slice(last)));
}
export function renderAnswer(text){
 const out=node('div','answer-markdown'),lines=text.replace(/\r\n/g,'\n').split('\n');let i=0;
 const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
 while(i<lines.length){let line=lines[i];if(!line.trim()){i++;continue;}
  if(/^```/.test(line.trim())){const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i].trim()))code.push(lines[i++]);i++;const pre=node('pre');pre.append(node('code','',code.join('\n')));out.append(pre);continue;}
  if(i+1<lines.length&&line.includes('|')&&cells(lines[i+1]).every(x=>/^:?-{3,}:?$/.test(x))){const wrap=node('div','answer-table'),table=node('table'),head=node('thead'),header=node('tr');for(const cell of cells(line)){const th=node('th');inline(th,cell);header.append(th);}head.append(header);table.append(head);i+=2;const body=node('tbody');while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){const row=node('tr');for(const cell of cells(lines[i++])){const td=node('td');inline(td,cell);row.append(td);}body.append(row);}table.append(body);wrap.append(table);out.append(wrap);continue;}
  const h=line.match(/^(#{1,6})\s+(.+)/);if(h){const heading=node('h'+Math.min(4,h[1].length+1));inline(heading,h[2]);out.append(heading);i++;continue;}
  if(/^\s*([-*+] |\d+[.)] )/.test(line)){const ordered=/^\s*\d+[.)] /.test(line),list=node(ordered?'ol':'ul');while(i<lines.length&&(ordered?/^\s*\d+[.)] /:/^\s*[-*+] /).test(lines[i])){const item=node('li');inline(item,lines[i++].replace(/^\s*(?:[-*+]|\d+[.)])\s+/,''));list.append(item);}out.append(list);continue;}
  const paragraph=node(line.startsWith('> ')?'blockquote':'p');inline(paragraph,line.replace(/^> /,''));out.append(paragraph);i++;
 }
 return out;
}
