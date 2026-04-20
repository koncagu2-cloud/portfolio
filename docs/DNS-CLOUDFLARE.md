# Custom domain: Cloudflare DNS + GitHub Pages

Your site deploys from **`koncagu2-cloud/portfolio`**. GitHub Pages expects a **CNAME target** of:

`koncagu2-cloud.github.io`

(That is your **user/org GitHub Pages hostname**, not the repo name.)

## 1) Finish Cloudflare “pending” (nameservers)

“Pending” usually means **nameservers are not yet pointing to Cloudflare** at your registrar.

1. Log into **where you bought the domain** (registrar).
2. Set **only** these nameservers (delete any others):

   - `holly.ns.cloudflare.com`
   - `konnor.ns.cloudflare.com`

3. Turn **DNSSEC off** at the registrar while switching (you can re-enable later in Cloudflare if needed).
4. Wait until Cloudflare **Overview** shows the zone **Active** (can be minutes–hours).

Until this is done, DNS records you add may not help public resolution yet.

## 2) Add DNS records in Cloudflare

In **DNS → Records** for `suleymankoncagul.com`, add:

### `www` (recommended primary)

| Type   | Name | Content                    | Proxy status |
| ------ | ---- | -------------------------- | ------------ |
| CNAME  | www  | `koncagu2-cloud.github.io` | **DNS only** (grey cloud) |

### Apex (`suleymankoncagul.com` without `www`)

Add **four** A records:

| Type | Name | Content         | Proxy |
| ---- | ---- | --------------- | ----- |
| A    | @    | `185.199.108.153` | DNS only |
| A    | @    | `185.199.109.153` | DNS only |
| A    | @    | `185.199.110.153` | DNS only |
| A    | @    | `185.199.111.153` | DNS only |

Add **four** AAAA records:

| Type | Name | Content              | Proxy |
| ---- | ---- | -------------------- | ----- |
| AAAA | @    | `2606:50c0:8000::153` | DNS only |
| AAAA | @    | `2606:50c0:8001::153` | DNS only |
| AAAA | @    | `2606:50c0:8002::153` | DNS only |
| AAAA | @    | `2606:50c0:8003::153` | DNS only |

**Why DNS only:** Orange-cloud “proxied” can interfere with GitHub’s domain verification / HTTPS until you know what you’re doing.

### Email (optional)

Skip **MX** until you want `you@suleymankoncagul.com` email. No MX is normal for a portfolio-only domain.

## 3) GitHub repo settings

1. **Settings → Pages → Custom domain**  
   - Enter **`suleymankoncagul.com`** (and/or add **`www.suleymankoncagul.com`** — GitHub will guide you).  
   - Wait for **DNS check** to pass.

2. Enable **Enforce HTTPS** (after DNS propagates).

3. **Settings → Actions → Variables** (Repository variables)  
   - Add **`VITE_BASE`** = **`/`**  
   - This makes the Vite build assets load from the **domain root** (required for a custom domain).

4. Push a commit or **re-run** the “Deploy to GitHub Pages” workflow so the next build uses `VITE_BASE=/`.

## 4) Verify

- `https://www.suleymankoncagul.com/portfolio/` should **not** be the URL anymore; the site should live at **`/`** on the custom domain after `VITE_BASE=/`.
- Open a few routes (e.g. `/projects`) and refresh — should not 404.

If anything still fails, confirm nameservers are **Active** in Cloudflare first, then re-check DNS records in GitHub’s Pages domain panel.
