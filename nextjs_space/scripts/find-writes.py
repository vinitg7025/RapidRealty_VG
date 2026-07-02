import json

log_path = "/Users/vinitg/.gemini/antigravity-ide/brain/53e8d52d-3be1-46b9-9b6a-4f56fcf8ffa0/.system_generated/logs/transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Look for tool calls that edit or write microsite-view.tsx
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args", {})
                target = args.get("TargetFile", "")
                if "microsite-view.tsx" in target:
                    # Print step_index, tool name, and instruction/desc to locate the correct write
                    print(f"Step: {data.get('step_index')} | Tool: {tc.get('name')} | Instruction: {args.get('Instruction')} | Desc: {args.get('Description')}")
        except Exception as e:
            pass
