// F9: offline and conservative Android debug build contract, not a Play compliance certificate.
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function checkAndroidSources(source){
 const failures=[];
 const {gradle,manifest,main,origin,workflow}=source;
 if(!/\bcompileSdk\s+36\b/.test(gradle)||!/\btargetSdk\s+36\b/.test(gradle))
  failures.push('Android must target and compile against API 36');
 if(!/\bminSdk\s+28\b/.test(gradle))
  failures.push('Minimum Android 9 support absent');
 if(!gradle.includes("System.getenv('COBRAFLUX_ANDROID_ORIGIN') ?: ''")||
  !gradle.includes("buildConfigField 'String', 'WEB_ORIGIN'"))
  failures.push('Missing build-time explicit HTTPS origin');
 if(!manifest.includes('android:usesCleartextTraffic="false"')||
  !manifest.includes('android:allowBackup="false"'))
  failures.push('Cleartext or backup guard missing');
 if(!main.includes('WebView.setWebContentsDebuggingEnabled(false)')||
  !main.includes('setAllowFileAccess(false)')||
  !main.includes('setAllowContentAccess(false)')||
  !main.includes('setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)')||
  !main.includes('setAcceptThirdPartyCookies(web,false)')||
  !main.includes('handler.cancel()'))
  failures.push('WebView security defaults missing');
 if(/addJavascriptInterface\s*\(/.test(main))
  failures.push('Native JavaScript bridge is prohibited');
 if(!origin.includes('isFirstParty(')||
  !origin.includes('externalBrowserAllowed('))
  failures.push('No explicit first-party URL policy');
 if(!workflow.includes("COBRAFLUX_ANDROID_ORIGIN: ''")||
  !workflow.includes(':app:testDebugUnitTest :app:assembleDebug')||
  /:app:bundleRelease|:app:assembleRelease|signingConfig\b/.test(workflow))
  failures.push('CI must build unsigned-for-release debug preview only');
 for(const content of [gradle,manifest,main,origin,workflow]){
  if(/ais-pre-msim|studioforce\.com|demo1234|rafael@|camila@nutrivida/i.test(content))
   failures.push('Historical demo URL or account leaked into operational app');
 }
 return failures;
}
export async function inspect(dir=root){
 const paths={
  gradle:'mobile/android/app/build.gradle',
  manifest:'mobile/android/app/src/main/AndroidManifest.xml',
  main:'mobile/android/app/src/main/java/com/cobraflux/app/MainActivity.java',
  origin:'mobile/android/app/src/main/java/com/cobraflux/app/OriginPolicy.java',
  workflow:'.github/workflows/phase9-android-preview.yml'
 };
 const entries=await Promise.all(Object.entries(paths).map(async([key,p])=>[key,await readFile(resolve(dir,p),'utf8')]));
 return checkAndroidSources(Object.fromEntries(entries));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const errors=await inspect();
  for(const e of errors)process.stderr.write('F9 ANDROID POLICY FAILED: '+e+'\n');
  process.stdout.write('F9 Android offline source guard: '+(errors.length?'FAILED':'PASS')+
   '; Play release/staging/physical device NOT approved\n');
  if(errors.length)process.exitCode=1;
 }catch{process.stderr.write('F9 Android source check incomplete\n');process.exitCode=1;}
}
