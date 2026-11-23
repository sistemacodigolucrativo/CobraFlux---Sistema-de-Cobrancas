import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect,checkAndroidSources} from './phase9-android-contract.mjs';
const valid={
 gradle:"compileSdk 36\nminSdk 28\ntargetSdk 36\nSystem.getenv('COBRAFLUX_ANDROID_ORIGIN') ?: ''\nbuildConfigField 'String', 'WEB_ORIGIN'",
 manifest:'android:usesCleartextTraffic="false" android:allowBackup="false"',
 main:'WebView.setWebContentsDebuggingEnabled(false);setAllowFileAccess(false);setAllowContentAccess(false);setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);setAcceptThirdPartyCookies(web,false);handler.cancel()',
 origin:'isFirstParty( externalBrowserAllowed(',
 workflow:"COBRAFLUX_ANDROID_ORIGIN: ''\n:app:testDebugUnitTest :app:assembleDebug"
};
test('F9 source guard passes on the actual Android project',async()=>{
 assert.deepEqual(await inspect(),[]);
});
test('insecure flags, demo accounts, Play release and bridge are rejected',()=>{
 const variants=[
  {...valid,gradle:valid.gradle.replace('targetSdk 36','targetSdk 35')},
  {...valid,manifest:valid.manifest.replace('allowBackup="false"','allowBackup="true"')},
  {...valid,main:valid.main+' addJavascriptInterface(...)'},
  {...valid,workflow:valid.workflow+':app:bundleRelease'},
  {...valid,main:valid.main+' demo1234'}
 ];
 for(const v of variants)assert.ok(checkAndroidSources(v).length>0);
});
