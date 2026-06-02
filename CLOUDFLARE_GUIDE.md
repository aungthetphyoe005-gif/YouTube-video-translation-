# 🌐 Cloudflare Pages & Cloudflare Worker Deployment Guide
### TubeTranslate AI-စနစ်အား Cloudflare တွင် အခမဲ့ လွယ်ကူစွာ တင်ယူအသုံးပြုနည်း လမ်းညွှန်

ဤလမ်းညွှန်ချက်သည် **Vite/React Frontend** ကို **Cloudflare Pages** တွင်လည်းကောင်း၊ **Gemini AI Backend** ကို **Cloudflare Workers** တွင်လည်းကောင်း သီးခြားစီ သို့မဟုတ် အတူတကွ အခမဲ့ တင်ယူအသုံးပြုနိုင်ရန် ရေးသားထားခြင်းဖြစ်ပါသည်။

---

## 🛠️ ပြင်ဆင်ထားသော ဖိုင်များ (Prepared Files)

သင့်တောင်းဆိုမှုအရ Cloudflare တွင် တင်ပြီး အသုံးပြုရန် လိုအပ်သော ဖိုင်များကို Root ပတ်လမ်း (Root directory) တွင် အဆင်သင့် ဖန်တီးပေးထားပြီး ဖြစ်ပါသည် -
1. **`worker.ts`**: Cloudflare Workers ပေါ်တွင် လုပ်ဆောင်ပေးမည့် Serverless API Code ဖြစ်သည်။ API route များဖြစ်သော `/api/youtube-info`, `/api/translate` နှင့် `/api/ai-summarize-translate` တို့ ပါဝင်ပြီး ဖြစ်သည်။
2. **`wrangler.toml`**: Cloudflare CLI tool (Wrangler) နှင့် ချိတ်ဆက်ရန် configuration များကို သတ်မှတ်ပေးထားသော ဖိုင်ဖြစ်သည်။

---

## 🚀 Deployment အဆင့်များ (Step-by-Step Deploy Guide)

### အဆင့် ၁ - Backend Worker ကို တင်ယူခြင်း (Deploying the Cloudflare Worker API)

သင်၏ Client app မှ Gemini API များကို လုံခြုံစွာ လှမ်းသုံးနိုင်ရန် Backend API Worker တစ်ခု ဦးစွာ ဖန်တီးရပါမည်။

1. သင်၏ စက်ထဲတွင် Cloudflare CLI (Wrangler) ဖြင့် Login ဝင်ပါ -
   ```bash
   npx wrangler login
   ```
2. Cloudflare Developer Dashboard သိုမဟုတ် Terminal မှတစ်ဆင့် သင့် Worker ကို Publish/Deploy လုပ်ပါ -
   ```bash
   npx wrangler deploy
   ```
   **အောင်မြင်ပါက** `https://tubetranslate-ai-api.<your-subdomain>.workers.dev` ကဲ့သို့သော Endpoint URL တစ်ခုကို ရရှိမည်ဖြစ်သည်။

3. **အရေးကြီးဆုံးအချက် (Add Secrets):** သင့် Gemini AI အလုပ်လုပ်နိုင်ရန် Cloudflare Environment တွင် `GEMINI_API_KEY` သတ်မှတ်ပေးရပါမည်။ Terminal တွင် အောက်ပါ command ကို ရိုက်ထည့်ပါ -
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
   *(ညွှန်ကြားချက် ပေါ်လာပါက Gemini API Key အစစ်အမှန်ကို ထည့်သွင်းပေးပါ)*

---

### အဆင့် ၂ - Frontend Pages ကို တင်ယူခြင်း (Deploying Static React APP to Cloudflare Pages)

ယခု Frontend Website ကို Pages ပေါ် တင်ပါမည်။

#### ✨ နည်းလမ်း (A) - Cloudflare Pages Site Dashboard မှ တင်ယူနည်း (အကြံပြုထားသော နည်းလမ်း)
1. သင့် Code ကို Github/GitLab တွင် Commit တင်ပါ။
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) သို့ သွားပြီး **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git** ကို နှိပ်ပါ။
3. သင်၏ Repository ကို ရွေးချယ်ပြီး Build Settings တွင် အောက်ပါအတိုင်း သတ်မှတ်ပေးပါ -
   - **Framework preset**: `Vite` (သို့မဟုတ် `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **API ချိတ်ဆက်ရန် (Environment Variables Setup):**
   - **Environment variables (Advanced)** အပိုင်းတွင် Variable အသစ် တစ်ခုထည့်ပါ -
     - Name: `VITE_API_URL`
     - Value: `https://tubetranslate-ai-api.<your-subdomain>.workers.dev` *(အဆင့် ၁ တွင် သင်ရရှိခဲ့သော Worker URL ဖြစ်သည်၊ အစွန်းရှိ `/` ကို ချန်လှပ်ပါ)*
5. **Save and Deploy** ကို နှိပ်လိုက်ပါက စက္ကန့်ပိုင်းအတွင်း Website အွန်လိုင်းပေါ် ရောက်ရှိသွားမည်ဖြစ်ပြီး Cloudflare Worker API ရှေ့တန်းနှင့် ချိတ်ဆက်ပြီး လုပ်ဆောင်သွားမည်ဖြစ်သည်။

#### ✨ နည်းလမ်း (B) - Terminal/CLI ဖြင့် တိုက်ရိုက် တင်ယူနည်း
အကယ်၍ Git မသုံးလိုပါက Project ကို Build ဆွဲပြီး Wrangler ဖြင့် တိုက်ရိုက်တင်နိုင်သည် -
1. Frontend အား Build ဆွဲပါ -
   ```bash
   npm run build
   ```
2. Direct Upload ဖြင့် Pages ပေါ်သို့ static `dist` folder တင်ယူရန် အောက်ပါ command ကို သုံးပါ -
   ```bash
   npx wrangler pages deploy dist --project-name=tubetranslate-ai-frontend
   ```

---

## 🔒 Security & CORS configuration
- Cloudflare API Backend (`worker.ts`) တွင် Secure CORS headers များကို ထည့်သွင်းပေးထားပြီးဖြစ်သောကြောင့် Pages Frontend မှ API သို့ Cross-Origin Request လှမ်းခေါ်ယူမှုများကို browser က ပိတ်ဆို့မည်မဟုတ်ဘဲ အဆင်ပြေပြေ စနစ်တကျ လုပ်ဆောင်ပေးနိုင်မည်ဖြစ်ပါသည်။
- Gemini API model ကိုလည်း project denied access ပြဿနာမဖြစ်စေနိုင်သော၊ ပိုမိုတည်ငြိမ်မြန်ဆန်သော `gemini-2.0-flash` သို့ ပြောင်းလဲပြင်ဆင်ပေးထားပြီးဖြစ်ပါသည်။

---

## 📝 English Overview Instructions

1. **Backend Deployment**:
   - Install CLI dependencies and execute: `npx wrangler deploy` to push physical serverless routes to Cloudflare.
   - Inject your key securely: `npx wrangler secret put GEMINI_API_KEY`
2. **Frontend Deployment**:
   - Bind your build outputs (`dist`) using standard Cloudflare Pages configuration.
   - Define custom variable `VITE_API_URL` (pointing to your Worker trigger URL, e.g. `https://tubetranslate-ai-api.yoursub.workers.dev`) during Cloudflare Pages Build step to map API routing automatically.
