#!/usr/bin/env bash
# Validates the roninforge-react-router plugin structure and content.
# Run from anywhere: bash tests/validation/validate-plugin.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ERRORS=0
WARNINGS=0

red()    { printf "\033[31m%s\033[0m\n" "$1"; }
green()  { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

error() { red "ERROR: $1"; ERRORS=$((ERRORS + 1)); }
warn()  { yellow "WARN:  $1"; WARNINGS=$((WARNINGS + 1)); }
pass()  { green "PASS:  $1"; }

echo "=== Plugin Structure Validation ==="
echo ""

# 1. plugin.json valid JSON
PLUGIN_JSON="$REPO_ROOT/.cursor-plugin/plugin.json"
if [ -f "$PLUGIN_JSON" ]; then
    if python3 -c "import json; json.load(open('$PLUGIN_JSON'))" 2>/dev/null; then
        pass "plugin.json is valid JSON"
        NAME_VAL=$(python3 -c "import json; print(json.load(open('$PLUGIN_JSON')).get('name',''))")
        if [ "$NAME_VAL" = "roninforge-react-router" ]; then
            pass "plugin.json name is roninforge-react-router"
        else
            error "plugin.json name is '$NAME_VAL', expected 'roninforge-react-router'"
        fi
        for field in name version description license; do
            HAS=$(python3 -c "import json; d=json.load(open('$PLUGIN_JSON')); print('1' if '$field' in d else '0')")
            if [ "$HAS" = "1" ]; then
                pass "plugin.json has '$field'"
            else
                warn "plugin.json missing '$field'"
            fi
        done
    else
        error "plugin.json is not valid JSON"
    fi
else
    error ".cursor-plugin/plugin.json not found"
fi

echo ""
echo "=== Rule Files ==="
echo ""

RULE_COUNT=0
for rule_file in "$REPO_ROOT"/rules/*.mdc; do
    [ -f "$rule_file" ] || continue
    RULE_COUNT=$((RULE_COUNT + 1))
    fname=$(basename "$rule_file")
    first_line=$(head -1 "$rule_file")
    if [ "$first_line" = "---" ]; then
        pass "$fname has frontmatter"
        if grep -qE "^description:" "$rule_file"; then
            pass "$fname has description"
        else
            error "$fname missing description"
        fi
        if grep -qE "^globs:" "$rule_file"; then
            pass "$fname has globs"
        else
            warn "$fname missing globs"
        fi
    else
        error "$fname missing frontmatter"
    fi
done
echo "Total rule files: $RULE_COUNT"
if [ "$RULE_COUNT" -lt 10 ]; then
    error "Expected at least 10 rule files, found $RULE_COUNT"
fi

echo ""
echo "=== Skill Files ==="
echo ""

SKILL_COUNT=0
for skill_dir in "$REPO_ROOT"/skills/*/; do
    [ -d "$skill_dir" ] || continue
    SKILL_COUNT=$((SKILL_COUNT + 1))
    dname=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    if [ -f "$skill_file" ]; then
        first_line=$(head -1 "$skill_file")
        if [ "$first_line" = "---" ]; then
            pass "$dname/SKILL.md has frontmatter"
            NAME=$(awk '/^name:/ {print $2; exit}' "$skill_file")
            if [ "$NAME" = "$dname" ]; then
                pass "$dname/SKILL.md name matches dir"
            else
                error "$dname/SKILL.md name '$NAME' != dir '$dname'"
            fi
            if grep -qE "^description:" "$skill_file"; then
                pass "$dname/SKILL.md has description"
            else
                error "$dname/SKILL.md missing description"
            fi
        else
            error "$dname/SKILL.md missing frontmatter"
        fi
    else
        error "$dname/SKILL.md not found"
    fi
done
echo "Total skill dirs: $SKILL_COUNT"
if [ "$SKILL_COUNT" -lt 5 ]; then
    error "Expected at least 5 skills, found $SKILL_COUNT"
fi

echo ""
echo "=== Agent Files ==="
echo ""

AGENT_COUNT=0
for agent_file in "$REPO_ROOT"/agents/*.md; do
    [ -f "$agent_file" ] || continue
    AGENT_COUNT=$((AGENT_COUNT + 1))
    fname=$(basename "$agent_file")
    first_line=$(head -1 "$agent_file")
    if [ "$first_line" = "---" ]; then
        pass "$fname has frontmatter"
        if grep -qE "^name:" "$agent_file"; then
            pass "$fname has name"
        else
            error "$fname missing name"
        fi
        if grep -qE "^description:" "$agent_file"; then
            pass "$fname has description"
        else
            error "$fname missing description"
        fi
    else
        error "$fname missing frontmatter"
    fi
done
echo "Total agents: $AGENT_COUNT"

echo ""
echo "=== Correct Sample (must be clean) ==="
echo ""

CORRECT="$REPO_ROOT/tests/fixtures/correct-sample"
if [ ! -d "$CORRECT" ]; then
    error "correct-sample dir not found"
else
    # Forbidden patterns in correct-sample
    declare -a FORBID=(
        '@remix-run/'
        'useLoaderData<typeof'
        '(^|[^.])\bjson\('
        '\bdefer\('
        'RemixServer'
        'RemixBrowser'
        'BrowserRouter'
        '<Routes>'
        'react-router-dom'
        '\bLoaderFunction\b'
        '\bActionFunction\b'
        '\bLoaderFunctionArgs\b'
        '\bActionFunctionArgs\b'
        '(^|[^.])\bMetaFunction\b'
        '(^|[^.])\bLinksFunction\b'
        'unstable_useViewTransitionState'
        'unstable_viewTransition'
        'vitePlugin as remix'
        "from 'lucia'"
        'from "lucia"'
        'import\.meta\.env\.VITE_[A-Z_]*SECRET'
        'process\.env\.SESSION_SECRET!'
        'throw new Error\('
    )
    for pat in "${FORBID[@]}"; do
        # search code/config files only
        if grep -rEn "$pat" "$CORRECT" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.mjs" --include="*.cjs" 2>/dev/null; then
            error "correct-sample contains forbidden pattern: $pat"
        else
            pass "correct-sample free of: $pat"
        fi
    done

    # Files that must NOT exist in correct-sample
    if [ -f "$CORRECT/app/routes/index.tsx" ]; then
        error "correct-sample has app/routes/index.tsx (should be _index.tsx or routed in routes.ts)"
    else
        pass "correct-sample has no app/routes/index.tsx"
    fi
    if [ -f "$CORRECT/app/lib/db.ts" ]; then
        error "correct-sample has app/lib/db.ts without .server suffix"
    else
        pass "correct-sample db module is .server-scoped (no app/lib/db.ts)"
    fi
    if [ -f "$CORRECT/remix.config.js" ]; then
        error "correct-sample has remix.config.js (delete it)"
    else
        pass "correct-sample has no remix.config.js"
    fi

    # Required files
    if [ -f "$CORRECT/react-router.config.ts" ]; then
        pass "correct-sample has react-router.config.ts"
    else
        error "correct-sample missing react-router.config.ts"
    fi
    if [ -f "$CORRECT/app/root.tsx" ]; then
        pass "correct-sample has app/root.tsx"
        for tag in '<Meta' '<Links' '<Scripts' '<ScrollRestoration'; do
            if grep -q "$tag" "$CORRECT/app/root.tsx"; then
                pass "root.tsx contains $tag"
            else
                error "root.tsx missing $tag"
            fi
        done
    else
        error "correct-sample missing app/root.tsx"
    fi

    # Pinned versions
    if python3 -c "
import json,sys
p=json.load(open('$CORRECT/package.json'))
rr=p.get('dependencies',{}).get('react-router','')
ok = rr.startswith('^7.15') or rr.startswith('7.15')
sys.exit(0 if ok else 1)
"; then
        pass "correct-sample pins react-router ^7.15"
    else
        error "correct-sample react-router not pinned to ^7.15"
    fi

    if python3 -c "
import json,sys
p=json.load(open('$CORRECT/package.json'))
n=p.get('engines',{}).get('node','')
sys.exit(0 if '20.19' in n or '>=20' in n else 1)
"; then
        pass "correct-sample pins node >=20.19"
    else
        error "correct-sample node engine not >=20.19"
    fi
fi

echo ""
echo "=== Anti-Pattern Sample (must CONTAIN markers) ==="
echo ""

ANTI="$REPO_ROOT/tests/fixtures/anti-pattern-sample"
if [ ! -d "$ANTI" ]; then
    error "anti-pattern-sample dir not found"
else
    declare -a REQUIRE=(
        '@remix-run/'
        'useLoaderData<typeof'
        '(^|[^.])\bjson\('
        'RemixServer'
        'RemixBrowser'
        'BrowserRouter'
        'react-router-dom'
        '\bLoaderFunction\b'
        '\bLoaderFunctionArgs\b'
        '\bActionFunction\b'
        '\bActionFunctionArgs\b'
        'vitePlugin as remix'
        'from "lucia"'
        'import\.meta\.env\.VITE_[A-Z_]*SECRET'
        'process\.env\.SESSION_SECRET!'
        'throw new Error\('
        '\bdefer\('
        '\bMetaFunction\b'
        '\bLinksFunction\b'
        'unstable_useViewTransitionState'
        'unstable_viewTransition'
        'useTransition'
        'node:fs'
        'clientLoader\.hydrate'
    )
    for pat in "${REQUIRE[@]}"; do
        if grep -rEn "$pat" "$ANTI" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.mjs" --include="*.cjs" >/dev/null 2>&1; then
            pass "anti-pattern-sample contains: $pat"
        else
            error "anti-pattern-sample missing marker: $pat"
        fi
    done
    if [ -f "$ANTI/remix.config.js" ]; then
        pass "anti-pattern-sample has remix.config.js"
    else
        error "anti-pattern-sample missing remix.config.js"
    fi
    if [ -f "$ANTI/app/routes/index.tsx" ]; then
        pass "anti-pattern-sample has app/routes/index.tsx (anti-pattern)"
    else
        error "anti-pattern-sample missing app/routes/index.tsx marker"
    fi
fi

echo ""
echo "=== Em-Dash and Emoji Audit ==="
echo ""

EMDASH=$(grep -rln $'\xe2\x80\x94' "$REPO_ROOT/rules" "$REPO_ROOT/skills" "$REPO_ROOT/agents" "$REPO_ROOT/README.md" 2>/dev/null || true)
if [ -z "$EMDASH" ]; then
    pass "No em dashes in rules/skills/agents/README"
else
    error "Em dashes found in: $EMDASH"
fi

# Emoji scan: any character with code point >= 0x1F000 (rough), or BMP common pictographs
EMOJI_HITS=$(python3 - <<PY
import os,re,sys
roots=["$REPO_ROOT/rules","$REPO_ROOT/skills","$REPO_ROOT/agents","$REPO_ROOT/README.md"]
# Skip well-known non-emoji symbols we may use (none expected). We block: emoticons, pictographs, transport, flags, supplemental symbols.
RANGES=[
    (0x1F300,0x1FAFF),
    (0x2600,0x27BF),
    (0x1F000,0x1F02F),
]
def is_emoji(c):
    o=ord(c)
    for a,b in RANGES:
        if a<=o<=b: return True
    return False
hits=[]
def scan(p):
    try:
        with open(p,encoding="utf-8",errors="ignore") as f:
            for i,line in enumerate(f,1):
                for c in line:
                    if is_emoji(c):
                        hits.append(f"{p}:{i}:{c}")
                        break
    except Exception:
        pass
for r in roots:
    if os.path.isfile(r): scan(r)
    elif os.path.isdir(r):
        for dp,_,fs in os.walk(r):
            for fn in fs:
                if fn.endswith((".md",".mdc")):
                    scan(os.path.join(dp,fn))
print("\n".join(hits))
PY
)
if [ -z "$EMOJI_HITS" ]; then
    pass "No emojis in rules/skills/agents/README"
else
    error "Emojis found:\n$EMOJI_HITS"
fi

echo ""
echo "=========================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo "=========================="

if [ "$ERRORS" -gt 0 ]; then
    red "VALIDATION FAILED"
    exit 1
fi
green "ALL CHECKS PASSED"
exit 0
