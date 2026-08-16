let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
doautoall SessionLoadPre
silent only
silent tabonly
cd ~/Developer/Work/personalWork/atlas
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
set shortmess+=aoO
badd +6 .env
badd +1 .env.example
badd +16 package.json
badd +27 apps/admin/package.json
badd +27 apps/api/src/app.ts
badd +1 packages/config/src/index.ts
badd +3 ~/Developer/Work/personalWork/atlas/apps/api/src/plugins/errorHandler.ts
badd +5 packages/config/package.json
badd +16 packages/config/src/env.ts
badd +8 apps/api/src/index.ts
badd +12 apps/api/package.json
badd +5 packages/config/tsconfig.json
badd +14 packages/typescript-config/base.json
badd +1 packages/eslint-config/base.js
badd +16 packages/database/package.json
badd +144 .agent/plan.md
badd +1 packages/database/src/index.ts
badd +6 ~/Developer/Work/personalWork/atlas/packages/database/drizzle.config.ts
argglobal
%argdel
edit apps/api/src/app.ts
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd _ | wincmd |
split
1wincmd k
wincmd w
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe '1resize ' . ((&lines * 30 + 31) / 62)
exe 'vert 1resize ' . ((&columns * 159 + 159) / 318)
exe '2resize ' . ((&lines * 29 + 31) / 62)
exe 'vert 2resize ' . ((&columns * 159 + 159) / 318)
exe 'vert 3resize ' . ((&columns * 158 + 159) / 318)
argglobal
balt apps/api/src/index.ts
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 42 - ((29 * winheight(0) + 15) / 30)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 42
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("packages/database/src/index.ts", ":p")) | buffer packages/database/src/index.ts | else | edit packages/database/src/index.ts | endif
if &buftype ==# 'terminal'
  silent file packages/database/src/index.ts
endif
balt ~/Developer/Work/personalWork/atlas/packages/database/drizzle.config.ts
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 1 - ((0 * winheight(0) + 14) / 29)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 024|
wincmd w
argglobal
if bufexists(fnamemodify("packages/config/src/index.ts", ":p")) | buffer packages/config/src/index.ts | else | edit packages/config/src/index.ts | endif
if &buftype ==# 'terminal'
  silent file packages/config/src/index.ts
endif
balt packages/config/package.json
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 1 - ((0 * winheight(0) + 30) / 60)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 023|
wincmd w
2wincmd w
exe '1resize ' . ((&lines * 30 + 31) / 62)
exe 'vert 1resize ' . ((&columns * 159 + 159) / 318)
exe '2resize ' . ((&lines * 29 + 31) / 62)
exe 'vert 2resize ' . ((&columns * 159 + 159) / 318)
exe 'vert 3resize ' . ((&columns * 158 + 159) / 318)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
