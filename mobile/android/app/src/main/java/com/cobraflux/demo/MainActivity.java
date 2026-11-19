package com.cobraflux.demo;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Message;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.URLUtil;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.util.Locale;

/** CobraFlux, variante debug WebView para Android 9 ou posterior. */
public final class MainActivity extends Activity {
  private static final String HOST="ais-pre-msimlmgt5przoevld4skw4-834563986019.us-east1.run.app";
  private static final String URL="https://"+HOST;
  private static final String PAGAR=URL+"/#/pagar/gb-3v7p9n2w";
  private static final String PREMIUM=URL+"/?autostart=1";
  private static final String LOGIN=URL+"/#/entrar";
  private static final String ADMIN=URL+"/#/admin";
  private static final int BG=Color.rgb(9,12,19);
  private static final int CARD=Color.rgb(22,29,42);
  private static final int LINE=Color.rgb(46,58,72);
  private static final int GOLD=Color.rgb(255,211,90);
  private static final int GREEN=Color.rgb(51,230,176);
  private static final int WHITE=Color.rgb(242,246,252);
  private static final int MUTED=Color.rgb(168,179,193);
  private static final int PICK=8112;
  private LinearLayout root;
  private WebView browser;
  private ProgressBar progress;
  private ValueCallback<Uri[]> upload;
  private String screen="home", lastUrl=URL, pageTitle="CobraFlux";

  private int dp(int v) { return Math.round(v*getResources().getDisplayMetrics().density); }
  private GradientDrawable bg(int color) {
    GradientDrawable d=new GradientDrawable(); d.setColor(color); d.setCornerRadius(dp(16));
    d.setStroke(dp(1),LINE); return d;
  }
  private TextView text(String s,int size,int color,boolean bold) {
    TextView t=new TextView(this);
    t.setText(s); t.setTextSize(size); t.setTextColor(color);
    if(bold)t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
    t.setGravity(Gravity.CENTER_VERTICAL); return t;
  }
  private LinearLayout column() {LinearLayout l=new LinearLayout(this);l.setOrientation(1);return l;}
  private void space(LinearLayout l,int size) {View v=new View(this);l.addView(v,new LinearLayout.LayoutParams(1,dp(size)));}
  private TextView button(String title,int color,Runnable callback) {
    TextView t=text(title,15,BG,true);
    t.setGravity(Gravity.CENTER);t.setMinHeight(dp(50));
    t.setPadding(dp(14),dp(10),dp(14),dp(10));
    GradientDrawable d=new GradientDrawable();
    d.setColor(color);d.setCornerRadius(dp(12));t.setBackground(d);
    t.setOnClickListener(v->callback.run());t.setFocusable(true);return t;
  }
  private void reset() {
    if(browser!=null && browser.getParent() instanceof ViewGroup) ((ViewGroup)browser.getParent()).removeView(browser);
    root.removeAllViews();
  }
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().setStatusBarColor(BG);getWindow().setNavigationBarColor(BG);
    root=column();root.setBackgroundColor(BG);setContentView(root);
    WebView.setWebContentsDebuggingEnabled(false);
    if(state!=null && "web".equals(state.getString("screen"))) {
      pageTitle=state.getString("title","CobraFlux");
      lastUrl=state.getString("url",URL);
      showWeb(lastUrl,pageTitle);
    }else if(state!=null && "accounts".equals(state.getString("screen")))showAccounts();
    else showWeb(URL,"CobraFlux");
  }
  @Override public void onSaveInstanceState(Bundle out){
    out.putString("screen",screen);out.putString("title",pageTitle);
    out.putString("url",browser==null?lastUrl:browser.getUrl());
    super.onSaveInstanceState(out);
  }
  private void scroll(LinearLayout body) {
    ScrollView v=new ScrollView(this);v.setFillViewport(true);
    v.addView(body);root.addView(v,new LinearLayout.LayoutParams(-1,-1));
  }
  private LinearLayout body() {
    LinearLayout c=column();c.setPadding(dp(18),dp(22),dp(18),dp(28));return c;
  }
  private void header(LinearLayout c,String title,String subtitle) {
    TextView brand=text("🐍  COBRAFLUX",30,GOLD,true);brand.setGravity(Gravity.CENTER);
    c.addView(brand);space(c,5);
    TextView sub=text("Gestão inteligente de cobranças e recorrências",12,MUTED,false);
    sub.setGravity(Gravity.CENTER);c.addView(sub);space(c,23);
    TextView heading=text(title,20,WHITE,true);c.addView(heading);space(c,7);
    c.addView(text(subtitle,13,MUTED,false));space(c,16);
  }
  private void card(LinearLayout c,String title,String desc,String action,int accent,Runnable fn) {
    LinearLayout panel=column();panel.setPadding(dp(16),dp(15),dp(16),dp(15));panel.setBackground(bg(CARD));
    panel.addView(text(title,16,WHITE,true));space(panel,8);
    panel.addView(text(desc,13,MUTED,false));space(panel,13);
    panel.addView(button(action,accent,fn));
    c.addView(panel,new LinearLayout.LayoutParams(-1,-2));space(c,12);
  }
  private void showHome() {
    screen="home";reset();
    LinearLayout c=body();
    header(c,"Ambiente demonstrativo","Escolha uma área para abrir diretamente na plataforma.");
    card(c,"01   |   Site institucional","Página pública, sem necessidade de login.","Acessar site",GREEN,()->open(URL,"Site institucional"));
    card(c,"02   |   Página de pagamento","Visão do pagador: cobrança e Pix simulados.","Abrir pagamento",GOLD,()->open(PAGAR,"Pagamento demo"));
    card(c,"03   |   Painel do profissional","Acesso Premium e login dos profissionais.","Acessar conta Premium",GREEN,()->open(PREMIUM,"Painel profissional"));
    card(c,"04   |   Administração","Acesso do proprietário da plataforma.","Abrir administração",GOLD,()->open(ADMIN,"Painel administrativo"));
    c.addView(button("Entrar com outra conta demo",GREEN,()->open(LOGIN,"Entrar")));space(c,11);
    c.addView(button("Ver e copiar credenciais de teste",GOLD,this::showAccounts));space(c,20);
    c.addView(text("🧪 AMBIENTE 100% DEMONSTRATIVO. Não são executados Pix reais nem enviados WhatsApps reais. Requer internet e servidor de demonstração disponível.",12,MUTED,false));
    scroll(c);
  }
  private void copy(String s){
    ClipboardManager cb=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
    cb.setPrimaryClip(ClipData.newPlainText("CobraFlux demo",s));
    Toast.makeText(this,"Copiado",Toast.LENGTH_SHORT).show();
  }
  private void account(LinearLayout c,String name,String note,String email){
    LinearLayout p=column();p.setPadding(dp(15),dp(15),dp(15),dp(15));p.setBackground(bg(CARD));
    p.addView(text(name,16,WHITE,true));space(p,3);p.addView(text(note,12,MUTED,false));
    space(p,10);p.addView(text("E-mail: "+email,13,WHITE,false));space(p,5);
    p.addView(text("Senha: demo1234",13,WHITE,false));space(p,10);
    p.addView(button("Copiar e-mail",GREEN,()->copy(email)));space(p,7);
    p.addView(button("Copiar senha",GOLD,()->copy("demo1234")));
    c.addView(p);space(c,12);
  }
  private void showAccounts(){
    screen="accounts";reset();LinearLayout c=body();
    c.addView(button("← Voltar ao site",GOLD,()->open(URL,"CobraFlux")));space(c,15);
    header(c,"Contas demonstrativas","Copie as credenciais para testar os perfis.");
    account(c,"Rafael Mendes","Plano Premium — principal","rafael@studioforce.com.br");
    account(c,"Dra. Camila Duarte","Gratuito — 4 de 5 clientes","camila@nutrivida.com.br");
    account(c,"Lucas Ferreira","Assinatura vencida","lucas@ferreiraconsult.com.br");
    account(c,"Clínica BellaForma","Clientes inadimplentes","contato@bellaforma.com.br");
    account(c,"Administrador","Proprietário da plataforma","admin@goldenbilling.com.br");
    c.addView(button("Abrir tela de login",GREEN,()->open(LOGIN,"Login profissional")));space(c,9);
    c.addView(button("Abrir painel administrativo",GOLD,()->open(ADMIN,"Administração")));space(c,14);
    c.addView(text("A plataforma demo aceita senhas de 4 ou mais caracteres. Para alternar, use ‘Trocar conta demo’ no menu inferior esquerdo. Para uma nova conta, use ‘Cadastrar profissional’.",12,MUTED,false));
    scroll(c);
  }
  private boolean isWebUrl(String address) {
    if(address==null)return false;
    try {
      Uri uri=Uri.parse(address);
      String scheme=uri.getScheme();
      return scheme!=null
        && ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
        && uri.getHost()!=null;
    }catch(Exception e){return false;}
  }
  private void open(String address,String title) {
    if(!isWebUrl(address))return;
    lastUrl=address;pageTitle=title;showWeb(address,title);
  }
  /** Links de sites permanecem dentro da WebView; apenas esquemas de apps externos saem dela. */
  private void routeLink(String address) {
    if(isWebUrl(address)) {
      if(browser!=null)browser.loadUrl(address);
      else open(address,"CobraFlux");
    } else external(address);
  }
  private void external(String address) {
    try {
      if(address==null)return;
      if(address.startsWith("intent:")) {
        Intent intent=Intent.parseUri(address,Intent.URI_INTENT_SCHEME);
        String fallback=intent.getStringExtra("browser_fallback_url");
        if(isWebUrl(fallback)){routeLink(fallback);return;}
        intent.setComponent(null);intent.setSelector(null);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        try{startActivity(intent);}
        catch(ActivityNotFoundException e){Toast.makeText(this,"Nenhum aplicativo compatível instalado",Toast.LENGTH_SHORT).show();}
        return;
      }
      Uri uri=Uri.parse(address);
      String scheme=uri.getScheme();
      if(scheme==null)return;
      switch(scheme.toLowerCase(Locale.ROOT)) {
        case "mailto":case "tel":case "sms":case "smsto":
        case "whatsapp":case "market":case "pix":
          Intent intent=new Intent(Intent.ACTION_VIEW,uri);
          intent.addCategory(Intent.CATEGORY_BROWSABLE);
          startActivity(intent);break;
        default:
          Toast.makeText(this,"Este tipo de link não é suportado",Toast.LENGTH_SHORT).show();
      }
    }catch(Exception e) {
      Toast.makeText(this,"Não foi possível abrir este link",Toast.LENGTH_LONG).show();
    }
  }
  private TextView nav(String label,Runnable run){
    TextView t=text(label,22,WHITE,true);t.setGravity(Gravity.CENTER);
    t.setMinWidth(dp(48));t.setMinHeight(dp(48));t.setOnClickListener(v->run.run());return t;
  }
  private WebView web(){
    if(browser!=null)return browser;
    browser=new WebView(this);browser.setBackgroundColor(WHITE);
    WebSettings s=browser.getSettings();
    s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);
    s.setAllowFileAccess(false);s.setAllowContentAccess(true);
    s.setJavaScriptCanOpenWindowsAutomatically(true);s.setSupportMultipleWindows(true);
    s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    s.setUseWideViewPort(true);s.setLoadWithOverviewMode(true);
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(browser,true);
    browser.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
        String link=r.getUrl().toString();
        if(isWebUrl(link))return false;
        if(link.startsWith("about:")||link.startsWith("blob:")||link.startsWith("data:")||link.startsWith("javascript:"))return false;
        external(link);return true;
      }
      @Override public boolean shouldOverrideUrlLoading(WebView v,String link){
        if(isWebUrl(link))return false;
        if(link.startsWith("about:")||link.startsWith("blob:")||link.startsWith("data:")||link.startsWith("javascript:"))return false;
        external(link);return true;
      }
      @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){
        if(r.isForMainFrame())Toast.makeText(MainActivity.this,"Falha ao carregar. Verifique a internet ou o servidor.",Toast.LENGTH_LONG).show();
      }
    });
    browser.setWebChromeClient(new WebChromeClient(){
      @Override public boolean onCreateWindow(WebView view,boolean isDialog,boolean isUserGesture,Message resultMsg) {
        if(!isUserGesture)return false;
        final WebView popup=new WebView(MainActivity.this);
        popup.setWebViewClient(new WebViewClient(){
          @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
            routeLink(r.getUrl().toString());
            v.post(()->v.destroy());return true;
          }
          @Override public boolean shouldOverrideUrlLoading(WebView v,String u){
            routeLink(u);v.post(()->v.destroy());return true;
          }
        });
        WebView.WebViewTransport transport=(WebView.WebViewTransport)resultMsg.obj;
        transport.setWebView(popup);
        resultMsg.sendToTarget();
        return true;
      }
      @Override public void onProgressChanged(WebView v,int n){
        if(progress!=null){progress.setProgress(n);progress.setVisibility(n>=100?View.GONE:View.VISIBLE);}
      }
      @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
        if(upload!=null)upload.onReceiveValue(null);
        upload=callback;try{
          Intent intent=params.createIntent();startActivityForResult(intent,PICK);return true;
        }catch(Exception e){upload=null;callback.onReceiveValue(null);return false;}
      }
    });
    browser.setDownloadListener((link,ua,cd,mime,length)->{
      try{
        DownloadManager.Request req=new DownloadManager.Request(Uri.parse(link));
        req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        String fn=URLUtil.guessFileName(link,cd,mime);
        req.setDestinationInExternalFilesDir(this,Environment.DIRECTORY_DOWNLOADS,fn);
        ((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(req);
        Toast.makeText(this,"Download iniciado",Toast.LENGTH_SHORT).show();
      }catch(Exception e){external(link);}
    });
    return browser;
  }
  /** Inicializa diretamente o site em uma WebView sem barra de endereços. */
  private void showWeb(String address,String title) {
    screen="web";reset();
    FrameLayout frame=new FrameLayout(this);
    root.addView(frame,new LinearLayout.LayoutParams(-1,-1));
    frame.addView(web(),new FrameLayout.LayoutParams(-1,-1));
    progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
    progress.setMax(100);
    progress.setProgressTintList(ColorStateList.valueOf(GREEN));
    FrameLayout.LayoutParams loading=new FrameLayout.LayoutParams(-1,dp(3),Gravity.TOP);
    frame.addView(progress,loading);
    TextView menu=text("☰",24,GOLD,true);
    menu.setGravity(Gravity.CENTER);
    menu.setContentDescription("Abrir menu CobraFlux");
    menu.setFocusable(true);menu.setElevation(dp(6));
    GradientDrawable rounded=new GradientDrawable();
    rounded.setColor(Color.argb(230,9,12,19));
    rounded.setCornerRadius(dp(24));
    rounded.setStroke(dp(1),GOLD);
    menu.setBackground(rounded);
    FrameLayout.LayoutParams pos=new FrameLayout.LayoutParams(dp(45),dp(45),Gravity.TOP|Gravity.END);
    pos.setMargins(0,dp(10),dp(10),0);
    frame.addView(menu,pos);
    menu.setOnClickListener(v->new AlertDialog.Builder(this)
      .setTitle("🐍 CobraFlux")
      .setItems(new String[]{
        "Site institucional","Página de pagamento","Painel profissional (Premium)",
        "Login profissional","Painel administrativo","Contas demonstrativas",
        "Central de acessos","Atualizar esta página","Voltar uma página"
      },(dialog,n)->{
        switch(n) {
          case 0:open(URL,"Site institucional");break;
          case 1:open(PAGAR,"Pagamento");break;
          case 2:open(PREMIUM,"Painel profissional");break;
          case 3:open(LOGIN,"Login profissional");break;
          case 4:open(ADMIN,"Administração");break;
          case 5:showAccounts();break;
          case 6:showHome();break;
          case 7:if(browser!=null)browser.reload();break;
          case 8:if(browser!=null&&browser.canGoBack())browser.goBack();break;
        }
      }).show());
    if(address!=null && !address.equals(browser.getUrl()))browser.loadUrl(address);
  }
  @Override protected void onActivityResult(int req,int result,Intent data) {
    super.onActivityResult(req,result,data);
    if(req==PICK&&upload!=null){
      Uri[] paths=null;
      if(result==RESULT_OK && data!=null){
        ClipData clips=data.getClipData();
        if(clips!=null){paths=new Uri[clips.getItemCount()];
          for(int i=0;i<clips.getItemCount();i++)paths[i]=clips.getItemAt(i).getUri();
        }else if(data.getData()!=null)paths=new Uri[]{data.getData()};
      }
      upload.onReceiveValue(paths);upload=null;
    }
  }
  @Override public void onBackPressed(){
    if("web".equals(screen)&&browser!=null&&browser.canGoBack()){
      browser.goBack();return;
    }else if("accounts".equals(screen)){open(URL,"CobraFlux");return;}
    new AlertDialog.Builder(this).setTitle("Sair do CobraFlux?")
      .setNegativeButton("Cancelar",null).setPositiveButton("Sair",(d,w)->finish()).show();
  }
  @Override protected void onDestroy(){
    if(browser!=null){if(browser.getParent() instanceof ViewGroup)((ViewGroup)browser.getParent()).removeView(browser);
      browser.destroy();browser=null;}
    super.onDestroy();
  }
}
