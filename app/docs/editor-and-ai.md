# Editor, Post Rendering, And AI

## Tiptap Editor Surface

The active post creation editor is `app/p/components/client-page.tsx`.

Configured extensions:

- `StarterKit` with custom horizontal rule disabled and links configured for edit selection.
- Custom `HorizontalRule`.
- `TextAlign` for headings and paragraphs.
- `TaskList` and nested `TaskItem`.
- `Highlight` with multicolor support.
- `Image`.
- `TextStyle` and `FontSize`.
- `Typography`.
- `Superscript` and `Subscript`.
- `Selection`.
- Custom `ImageUploadNode`.

Toolbar controls come from `packages/tiptap/components/tiptap-ui` and primitives from `packages/tiptap/components/tiptap-ui-primitive`.

Current controls include:

- Undo/redo.
- Heading dropdown.
- List dropdown.
- Blockquote.
- Code block.
- Font size.
- Bold, italic, strike.
- Color highlight.
- Link popover.
- Text alignment.
- Image upload.
- Theme toggle at the page level.
- AI panel toggle.

## Draft Persistence

`ClientPage` stores post drafts in `window.sessionStorage`:

- `title`
- `link`
- `content`

Editor theme is stored in `window.localStorage`:

- `editor-theme`: `dark` or `light`.

When the editor mounts, saved Tiptap JSON is parsed and restored. On every editor update, the current document JSON is serialized back into session storage.

## Publishing

The editor publishes through `POST /api/saveposts`.

Request body:

```json
{
  "title": "Post title",
  "link": "https://example.com",
  "content": {
    "type": "doc",
    "content": []
  }
}
```

The server validates using `postSchema`, serializes `content` with `JSON.stringify`, creates a `Post`, clears session draft keys on success, and routes back to `/dashboard`.

## Image Upload

Image uploads are handled by a custom Tiptap node and Cloudinary API route.

Relevant files:

- `packages/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension.ts`
- `packages/tiptap/components/tiptap-node/image-upload-node/image-upload-node.tsx`
- `lib/tiptap-utils.ts`
- `app/api/upload/route.ts`

Limits and validation:

- Client max size: `MAX_FILE_SIZE = 5MB`.
- Client allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`.
- Server allowed MIME types: same.
- Server requires Cloudinary env vars.

`handleImageUpload` uses `XMLHttpRequest` so upload progress can be reported and aborts can be supported.

## Post Rendering And Sanitization

Stored post content is Tiptap JSON text. Rendering happens in `lib/post-content.tsx`.

Flow:

1. Parse stored content as JSON.
2. Sanitize document nodes and marks against allowlists.
3. Render with `@tiptap/static-renderer/pm/react`.
4. Fall back to plain text if parsing or sanitization fails.

Allowed nodes:

- `doc`
- `text`
- `paragraph`
- `heading`
- `blockquote`
- `bulletList`
- `orderedList`
- `listItem`
- `taskList`
- `taskItem`
- `image`
- `codeBlock`
- `horizontalRule`
- `hardBreak`

Allowed marks:

- `bold`
- `italic`
- `strike`
- `code`
- `link`
- `highlight`
- `subscript`
- `superscript`
- `textStyle`

Sanitization details:

- Link protocols are limited to `http:`, `https:`, `mailto:`, and `tel:`, with relative/hash links allowed for post content.
- Image protocols are limited to `http:` and `https:`, with relative URLs allowed.
- Text alignment is limited to `left`, `center`, `right`, and `justify`.
- Heading levels are clamped to 1 through 6.
- Ordered list starts are clamped to 1 through 999.
- Image width/height are clamped to 1 through 4096.
- Link `rel` is forced to `noopener noreferrer nofollow`.

External project links use `getSafeExternalUrl`, which permits only `http:` and `https:`.

## Tiptap Package

`packages/tiptap` contains reusable editor code:

- `components/tiptap-ui`: behavior-aware editor controls.
- `components/tiptap-ui-primitive`: buttons, toolbars, menus, popovers, tooltips, inputs, cards, badges, separators, and spacers.
- `components/tiptap-icons`: local icon components.
- `components/tiptap-node`: node-specific SCSS and custom node extensions.
- `components/tiptap-extension`: extra extension code.
- `components/tiptap-templates/simple`: a full simple editor template and sample content.
- `hooks`: reusable editor/UI hooks.
- `styles`: SCSS variables and keyframes.

The active app editor imports many pieces from this package directly, while the template remains available as reference or a standalone editor implementation.

## Repository Indexing

Indexing starts from the AI panel or any caller of `POST /api/repos/index`.

### Start Route

`app/api/repos/index/route.ts`:

1. Requires authentication.
2. Validates `repoId`, `repoName`, and `accountId`.
3. Creates a `RepoIndexJob` with status `PENDING`.
4. Sends Inngest event `repos/index` with job and repo data.

### Inngest Function

`inngest/functions/indexRepo.ts`:

1. Marks job `INDEXING`.
2. Fetches GitHub access token through Better Auth.
3. Resolves GitHub repository details using `getRepoDetailsFromGithub`.
4. Fetches files with `getRepoFilesFromGithub`.
5. Chunks files with `chunkCodeFile`.
6. Embeds chunks in batches of 16 using `embedTexts`.
7. Upserts vectors into Pinecone under namespace `repo-${repoId}`.
8. Marks job `COMPLETED` with `chunksCount`.
9. Marks job `FAILED` and stores an error message on failure.

### GitHub File Fetching

`lib/github.ts` fetches repository files through the GitHub REST API.

Supported file extensions include:

- JavaScript/TypeScript/JSX/TSX.
- Python, Ruby, Go, Rust, Java, Kotlin, Swift.
- C/C++ headers and source.
- Markdown, MDX, text.
- JSON, YAML.
- HTML, CSS, SCSS.
- Shell scripts.

Skipped paths include:

- `node_modules`
- `.git`
- `dist`
- `build`
- `coverage`
- `.next`
- `vendor`
- `.cache`
- lockfiles and package manifests
- `.env`

The fetcher limits to 100 files by default and skips decoded files larger than 100 KB.

### Chunking

`lib/chunking.ts` produces chunks with:

- `id`
- `path`
- `text`
- `startLine`
- `endLine`

Code files are split around function/class/export/import-like boundaries once the current chunk exceeds roughly half the max size. Text and markdown are split at headings or max size, with overlap.

Defaults:

- `maxChunkSize`: 1500 characters.
- `overlap`: 200 characters.

### Embeddings

`lib/embeddings.ts` uses Hugging Face Inference Router:

- Model: `intfloat/multilingual-e5-large`.
- Env var: `HF_TOKEN`.
- Endpoint: feature extraction pipeline.

`embedTexts` normalizes both single-vector and batch-vector responses into `number[][]`.

### Pinecone

`lib/pinecone.ts`:

- Requires `PINECONE_API_KEY`.
- Requires `PINECONE_INDEX`.
- Lazily initializes a Pinecone client and index.
- Upserts batches of 100 vectors.
- Stores metadata: `text`, `path`, `startLine`, `endLine`.
- Queries with `topK`, default 5.
- Checks namespace existence with `describeIndexStats`.

## AI Generation

`app/api/ai/generate/route.ts` streams the AI writer response.

Validation:

- Requires session.
- Requires `repoId`.
- Requires non-empty `prompt`.
- Rejects prompts above 4000 characters.
- Requires indexed Pinecone namespace.
- Requires `OPENROUTER_API_KEY`.

Generation model:

- `nvidia/nemotron-3-super-120b-a12b:free`

The server embeds the user's prompt, queries Pinecone for top 5 chunks, and builds a context block of source snippets:

```text
[Source 1] path/to/file.ts (lines 1-20):
...
```

It then streams text/plain content to the client. The AI panel reads the stream with `ReadableStreamDefaultReader`, appends chunks to local state, and can insert the generated text into the editor.
