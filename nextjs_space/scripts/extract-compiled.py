import re

chunk_path = 'nextjs_space/.next/static/webpack/app/[...slug]/page.292dc7127b8bfc89.hot-update.js'
with open(chunk_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the start of the microsite-view module
# In webpack, module looks like: "(function(module, __webpack_exports__, __webpack_require__) { ... })" or similar.
# Let's search for "components/microsite/microsite-view.tsx"
start_pat = r'"\./components/microsite/microsite-view\.tsx":'
match = re.search(start_pat, content)
if match:
    start_idx = match.start()
    print("Found module start at:", start_idx)
    # Let's extract next 100000 characters and find the end
    sub = content[start_idx:start_idx+250000]
    with open('nextjs_space/components/microsite/microsite-view-compiled.js', 'w', encoding='utf-8') as out:
        out.write(sub)
    print("Wrote extracted compiled JS to components/microsite/microsite-view-compiled.js")
else:
    print("Could not find start pattern!")
