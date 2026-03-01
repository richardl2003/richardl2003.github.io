# Claude Code Instructions

## Obsidian CLI

The `obsidian` CLI is available for all vault interactions. **Always use it instead of reading/writing vault files directly.**

**Connected vault:** `main` at `/Users/richardli/Desktop/main`

### Searching

```bash
obsidian search query="<text>"                        # Full-text search
obsidian search query="<text>" format=json            # Parseable output
obsidian search query="<text>" path="folder/sub"      # Limit to folder
obsidian search query="<text>" limit=10               # Max results
obsidian search:context query="<text>" format=json    # Search with surrounding line context
```

### Reading Notes

```bash
obsidian read file="Note Name"                        # Read by name (wikilink-style)
obsidian read path="folder/note.md"                   # Read by exact path
obsidian daily:read                                   # Read today's daily note
obsidian random:read                                  # Read a random note
obsidian history:read file="Note Name" version=1      # Read a historical version
```

### Creating Notes

```bash
obsidian create name="Note Name" content="body text"
obsidian create path="folder/note.md" content="body text"
obsidian create name="Note Name" template="Template Name"
obsidian create name="Note Name" content="text" overwrite   # Overwrite if exists
obsidian daily                                              # Open/create today's daily note
obsidian unique name="Note Name" content="text"             # Create with unique name
```

### Appending and Prepending

```bash
obsidian append file="Note Name" content="text to add"
obsidian append file="Note Name" content="text" inline      # No leading newline
obsidian prepend file="Note Name" content="text to add"
obsidian daily:append content="text"                        # Append to today's daily note
obsidian daily:prepend content="text"                       # Prepend to today's daily note
```

Use `\n` for newlines and `\t` for tabs within content values.

### Managing Properties (Frontmatter)

```bash
obsidian property:read name="<key>" file="Note Name"
obsidian property:set name="<key>" value="<val>" file="Note Name"
obsidian property:set name="tags" value="tag1,tag2" type=list file="Note Name"
obsidian property:set name="done" value="true" type=checkbox file="Note Name"
obsidian property:remove name="<key>" file="Note Name"
obsidian properties file="Note Name" format=json            # All properties for a file
obsidian properties format=json                             # All properties across vault
obsidian properties counts sort=count                       # Sorted by occurrence count
```

Property types: `text`, `list`, `number`, `checkbox`, `date`, `datetime`

### Tags

```bash
obsidian tags                                         # List all tags
obsidian tags format=json counts                      # JSON with occurrence counts
obsidian tags sort=count                              # Sort by frequency
obsidian tags file="Note Name"                        # Tags on a specific file
obsidian tag name="<tag>" verbose                     # Files using a specific tag
```

### Backlinks

```bash
obsidian backlinks file="Note Name"                   # List backlinks
obsidian backlinks file="Note Name" format=json       # JSON output
obsidian backlinks file="Note Name" counts            # Include link counts
obsidian backlinks file="Note Name" total             # Just the count
```

### Listing and Navigating Files

```bash
obsidian files                                        # All files in vault
obsidian files folder="Projects" ext=md               # Filter by folder and extension
obsidian folders                                      # All folders
obsidian recents                                      # Recently opened files
obsidian file file="Note Name"                        # File metadata
obsidian links file="Note Name"                       # Outgoing links from a file
obsidian outline file="Note Name" format=json         # Headings/outline
obsidian orphans                                      # Files with no incoming links
obsidian deadends                                     # Files with no outgoing links
```

### Daily Notes

```bash
obsidian daily:path                                   # Get path of today's daily note
obsidian daily:read                                   # Read today's daily note
obsidian daily:append content="- new item"            # Append to today's note
obsidian daily:prepend content="## Morning"           # Prepend to today's note
```

### JSON Output

Append `format=json` to most commands for machine-readable output:

```bash
obsidian search query="text" format=json
obsidian tags format=json counts
obsidian backlinks file="Note" format=json
obsidian properties file="Note" format=json
obsidian outline file="Note" format=json
obsidian tasks format=json
```

### Vault Info

```bash
obsidian vault                                        # Name, path, file/folder counts, size
obsidian vault info=path                              # Just the path
obsidian vaults                                       # All known vaults
obsidian files total                                  # File count only
```

### Tasks

```bash
obsidian tasks                                        # All tasks
obsidian tasks todo format=json                       # Incomplete tasks as JSON
obsidian tasks done                                   # Completed tasks
obsidian tasks file="Note Name" verbose               # Tasks from a file with line numbers
obsidian task ref="folder/note.md:42" toggle          # Toggle a task by file:line
obsidian daily:read | grep '\- \['                    # Quick daily tasks scan
```

### Notes on File Resolution

- `file=` resolves by **name** (like wikilinks) — omit `.md` extension
- `path=` requires an **exact relative path** from vault root (e.g., `path="Projects/todo.md"`)
- Most commands default to the active file when neither is specified
- Quote values with spaces: `name="My Note Title"`
