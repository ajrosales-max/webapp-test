# vuln-demo

A small Express app pinned to known-vulnerable dependency versions. Built as a
Mode C demo target for Arguss: it has a realistic dependency tree (~197 packages),
a batch of findings whose fixes are clean patch/minor bumps (auto-merge candidates),
a couple whose only fix is a major bump (escalations), and fast, real CI so the
open-PR-and-merge loop doesn't stall on a slow pipeline.

## What's in the tree

19 direct dependencies are vulnerable. Rough breakdown from `npm audit`
(Arguss uses OSV, so its exact list will differ slightly):

- ~16 direct deps fix via patch/minor bump — auto-merge candidates
- jsonwebtoken (8 -> 9) and tar (6 -> 7) fix only via major bump — escalate
- request, form-data, tough-cookie, uuid have no fix available — decline/skip

## Run locally

```
npm ci
npm test        # node --test, ~0.5s
npm start       # serves on :3000
```

## Push to GitHub

```
git init
git add .
git commit -m "vuln-demo: pinned vulnerable deps + real fast CI"
git branch -M main
git remote add origin git@github.com:<you>/vuln-demo.git
git push -u origin main
```

The CI workflow runs on every pull request, which is what Arguss Mode C opens.

## Notes

- The lockfile is committed on purpose. Arguss and `npm ci` both read it; deleting
  it changes the resolved tree.
- CI is deliberately minimal but real (`npm ci` + `npm test`). It satisfies all four
  of Arguss's pipeline test-reality conditions, so findings land in the auto-merge
  envelope instead of getting globally vetoed.
- Runner *queue* time is outside your control and can spike to minutes at peak. Run
  time here is seconds; wall-clock-to-green is not guaranteed. Record the clip when
  CI cooperates.
