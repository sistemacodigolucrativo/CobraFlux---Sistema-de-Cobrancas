package com.cobraflux.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

/** First-party app shell, not a demonstration app and not an approved production release. */
public final class MainActivity extends Activity {
  private OriginPolicy policy;
  private WebView web;
  private LinearLayout message;
  private ProgressBar loading;
  private boolean sslFailure;

  @Override public void onCreate(Bundle state){
    super.onCreate(state);
    WebView.setWebContentsDebuggingEnabled(false);
    getWindow().setStatusBarColor(Color.rgb(9,12,19));
    getWindow().setNavigationBarColor(Color.rgb(9,12,19));
    try {policy=OriginPolicy.parse(BuildConfig.WEB_ORIGIN);}
    catch(IllegalArgumentException ignored){policy=null;}
    FrameLayout root=new FrameLayout(this);
    root.setBackgroundColor(Color.rgb(9,12,19));
    setContentView(root);
    web=new WebView(this);
    root.addView(web,new FrameLayout.LayoutParams(-1,-1));
    configureWeb();
    loading=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
    root.addView(loading,new FrameLayout.LayoutParams(-1,5,Gravity.TOP));
    message=new LinearLayout(this);
    message.setOrientation(LinearLayout.VERTICAL);
    message.setGravity(Gravity.CENTER);
    message.setPadding(40,40,40,40);
    message.setBackgroundColor(Color.rgb(9,12,19));
    root.addView(message,new FrameLayout.LayoutParams(-1,-1));
    if(policy==null){
      showMessage("Ambiente não configurado",
        "Este APK de desenvolvimento não contém servidor, usuários ou credenciais de demonstração.",false);
      return;
    }
    showMessage("Conexão segura","Conectando ao CobraFlux…",true);
    if(state!=null && web.restoreState(state)!=null)message.setVisibility(View.GONE);
    else web.loadUrl(policy.initialUrl());
  }

  private void configureWeb(){
    WebSettings settings=web.getSettings();
    settings.setJavaScriptEnabled(true); // Required by React, only first-party navigation.
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setAllowFileAccessFromFileURLs(false);
    settings.setAllowUniversalAccessFromFileURLs(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    settings.setJavaScriptCanOpenWindowsAutomatically(false);
    settings.setSupportMultipleWindows(false);
    settings.setGeolocationEnabled(false);
    settings.setMediaPlaybackRequiresUserGesture(true);
    settings.setSafeBrowsingEnabled(true);
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
    web.setWebChromeClient(new WebChromeClient(){
      @Override public void onProgressChanged(WebView view,int percent){
        if(loading!=null){loading.setProgress(percent);loading.setVisibility(percent>=100?View.GONE:View.VISIBLE);}
      }
      @Override public boolean onShowFileChooser(WebView view,
          android.webkit.ValueCallback<Uri[]> callback,FileChooserParams params){
        callback.onReceiveValue(null);
        Toast.makeText(MainActivity.this,"Anexos ainda não homologados",Toast.LENGTH_SHORT).show();
        return true;
      }
    });
    web.setDownloadListener((url,userAgent,contentDisposition,mime,size)->
      Toast.makeText(this,"Downloads ainda não homologados",Toast.LENGTH_LONG).show());
    web.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
        return navigate(request.getUrl().toString(),request.isForMainFrame(),request.hasGesture());
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view,String url){
        return navigate(url,true,false); // Cannot prove user gesture in old callback.
      }
      @Override public void onReceivedSslError(WebView view,SslErrorHandler handler,SslError error){
        handler.cancel(); sslFailure=true;
        showMessage("Conexão HTTPS rejeitada","Não foi possível validar o certificado.",true);
      }
      @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
        if(request.isForMainFrame())showMessage("Sem conexão segura",
          "Confira sua internet ou o ambiente autorizado.",true);
      }
      @Override public void onPageFinished(WebView view,String url){
        if(!sslFailure && policy!=null && policy.isFirstParty(url))message.setVisibility(View.GONE);
      }
    });
  }

  private boolean navigate(String url,boolean mainFrame,boolean gesture){
    if(!mainFrame)return true;
    if(policy!=null && policy.isFirstParty(url))return false;
    // External HTTP(S), phone and mail links never load inside the app WebView.
    if(gesture && OriginPolicy.externalBrowserAllowed(url)){
      try{
        Intent intent=new Intent(Intent.ACTION_VIEW,Uri.parse(url));
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        startActivity(intent);
      }catch(ActivityNotFoundException ignored){
        Toast.makeText(this,"Aplicativo externo indisponível",Toast.LENGTH_SHORT).show();
      }
    }
    return true;
  }

  private void showMessage(String title,String description,boolean retry){
    if(message==null)return;
    message.removeAllViews();message.setVisibility(View.VISIBLE);
    TextView heading=new TextView(this);
    heading.setText(title);heading.setTextColor(Color.WHITE);heading.setTextSize(22);
    heading.setGravity(Gravity.CENTER);
    message.addView(heading);
    TextView body=new TextView(this);
    body.setText(description);body.setTextSize(15);body.setTextColor(0xFFCBD5E1);
    body.setGravity(Gravity.CENTER);body.setPadding(0,20,0,20);
    message.addView(body);
    if(retry && policy!=null){
      Button button=new Button(this);button.setText("Tentar novamente");
      button.setOnClickListener(v->{sslFailure=false;message.setVisibility(View.GONE);web.loadUrl(policy.initialUrl());});
      message.addView(button);
    }
  }
  @Override public void onSaveInstanceState(Bundle state){
    if(web!=null && policy!=null)web.saveState(state);
    super.onSaveInstanceState(state);
  }
  @Override public void onBackPressed(){
    if(web!=null && web.canGoBack())web.goBack();
    else super.onBackPressed();
  }
  @Override protected void onDestroy(){
    if(web!=null){
      if(web.getParent() instanceof ViewGroup)((ViewGroup)web.getParent()).removeView(web);
      web.destroy();web=null;
    }
    super.onDestroy();
  }
}
