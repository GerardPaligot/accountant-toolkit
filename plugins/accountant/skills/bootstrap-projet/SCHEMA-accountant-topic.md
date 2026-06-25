# Schema — `accountant/` folder

> Normalized format to track exchanges with the accounting firm.
> One `_sujet.yaml` fiche per structuring topic, in a dedicated subfolder.
>
> **This is the normative reference for accountant topics, shipped with the `bootstrap-projet` skill.** It is read at runtime from `$SKILL_DIR/SCHEMA-accountant-topic.md` — the consumer does not need a copy in their workspace.

## Folder structure

```
accountant/
├── _index.yaml           ← machine-readable aggregate of all topics
├── README.md             ← human usage documentation
│
└── <topic-id>/           ← one subfolder per structuring topic
    ├── _sujet.yaml       ← topic fiche (status, cycle, deadlines, questions)
    ├── note.md           ← detailed note sent to the accountant (required if status != minimal)
    ├── mail-YYYY-MM-DD-envoi.md     ← body of the sent email (one per send)
    ├── mail-YYYY-MM-DD-reponse.md   ← accountant reply (when received)
    ├── annexe-*.{xlsx,pdf,csv}      ← main attachments linked to the topic
    └── annexes/                     ← subfolder for working documents (screenshots, drafts)
```

### Naming conventions

- **Topic (id)**: short kebab-case, without `note-` prefix. Ex: `an-nourriture`, `points-divers`, `convention-locaux`.
- **`note.md`**: canonical name of the topic's main note. No `note-cabinet-<id>.md` at the root.
- **Emails**: `mail-YYYY-MM-DD-{envoi|reponse|relance}.md`. Several emails possible within the cycle.
- **Main attachments**: `annexe-` prefix (ex: `annexe-regularisation.xlsx`). For working documents, use `annexes/`.

## `_sujet.yaml` schema

### Conventions

- **Encoding**: UTF-8.
- **Dates**: ISO 8601 `YYYY-MM-DD`.
- **Unknown / not-applicable fields**: `null`. Do not leave an empty string.
- **Empty arrays**: explicit `[]`.

### Fields

#### `topic` (required)
Identification of the topic.
```yaml
topic:
  id: <kebab-case>                   # unique identifier of the topic, = name of the subfolder
  title: <string>                    # short human title (~60 characters)
  recipient: <string>                # accounting firm or targeted contact (ex: your accounting firm, named contact)
  status: draft | sent | partial-reply | reply-received | resolved | abandoned
  creation_date: YYYY-MM-DD          # date the note was drafted (or date the topic was opened)
```

#### `cycle` (required)
Chronological log of actions taken on the topic.
```yaml
cycle:
  - date: YYYY-MM-DD
    action: note-drafting | email-sent | follow-up | accountant-reply | implementation | closure
    file: <string|null>             # name of the file produced or consumed (relative to the subfolder)
    note: <string|null>             # free comment (≤ 200 characters)
```

Recognized actions:
- `note-drafting` — first drafting or revision of `note.md`
- `email-sent` — sending an email to the accountant (file = `mail-YYYY-MM-DD-envoi.md`)
- `follow-up` — follow-up to the accountant (file = `mail-YYYY-MM-DD-relance.md`)
- `accountant-reply` — receipt of a reply (file = `mail-YYYY-MM-DD-reponse.md`)
- `implementation` — applying the accountant's decision on the Tiime/Revolut/CA3 side
- `closure` — topic resolved and archived

#### `deadlines` (required)
Key dates to monitor.
```yaml
deadlines:
  principle_reply: <YYYY-MM-DD|null>       # reply turnaround requested from the accountant
  accounting_action: <YYYY-MM-DD|null>     # internal deadline (ex: monthly CA3)
  expected_closure: <YYYY-MM-DD|null>      # cut-off date to resolve the topic
```

#### `open_questions` (required)
List of precise questions asked to the accountant, in short kebab-case.
```yaml
open_questions:
  - <kebab-case>            # ex: faisabilite-dispositif-AN, choix-option-A-ou-B
  - ...
```

When a question receives an answer, move it to `resolved_questions`.

#### `resolved_questions` (optional)
Same but for questions decided by the accountant.
```yaml
resolved_questions:
  - id: <kebab-case>
    date: YYYY-MM-DD
    reply_summary: <string>   # ≤ 200 characters, link to mail-reponse for the detail
```

#### `files` (required)
Pointers to the files linked to the topic.
```yaml
files:
  note: <path|null>                  # note.md or null if no formal note
  emails_sent: [<path>, ...]         # chronological list
  emails_received: [<path>, ...]
  attachments: [<path>, ...]         # main attachments
  working_attachments: <path|null>   # ex: annexes/ (subfolder)
```

#### `links` (optional)
Links to other workspace resources.
```yaml
links:
  project_todo: <string|null>        # ex: PROJET.md#item-3
  audit_decisions: <path|null>       # reference to the audit memory
  memory: [<string>, ...]            # names of associated memory files (without .md)
```

## Statuses — Transition rules

| Status | Definition | Next transition |
|---|---|---|
| `draft` | Note being drafted, not yet sent. | → `sent` when email sent |
| `sent` | Email gone, awaiting accountant reply. | → `partial-reply` or `reply-received` |
| `partial-reply` | Part of the questions has been handled. | → `reply-received` when all questions have an answer |
| `reply-received` | All questions have an accountant reply. | → `resolved` once implementation done |
| `resolved` | Decisions implemented in Tiime/Revolut/CA3. | Terminal (archiving). |
| `abandoned` | Topic canceled (contrary decision, change of strategy). | Terminal. |

## Regenerating `_index.yaml`

`_index.yaml` is derived: it aggregates all the `_sujet.yaml` of the folder. Manual regeneration for now (no dedicated automated skill, to be created if necessary). In case of loss, walk `accountant/*/_sujet.yaml` and reconstitute.

## Out of scope

- Tiime conversations, internal messaging: not versioned (volatile, out of workspace).
- Informal exchanges (Slack, SMS, oral): to be materialized in an email or a note before becoming a topic.
