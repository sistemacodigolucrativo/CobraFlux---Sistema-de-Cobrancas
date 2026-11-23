package com.cobraflux.app;
import org.junit.Test;
import static org.junit.Assert.*;

public final class OriginPolicyTest {
  @Test public void sameOriginOnly(){
    OriginPolicy p=OriginPolicy.parse("https://app.cobraflux.example.org/");
    assertEquals("https://app.cobraflux.example.org/",p.initialUrl());
    assertTrue(p.isFirstParty("https://app.cobraflux.example.org/api/health"));
    assertFalse(p.isFirstParty("http://app.cobraflux.example.org/"));
    assertFalse(p.isFirstParty("https://app.cobraflux.example.org.evil.org/"));
    assertFalse(p.isFirstParty("https://user:pass@app.cobraflux.example.org/"));
  }
  @Test public void rejectUnsafeOrigins(){
    for(String url:new String[]{"","http://company.org","https://localhost","https://127.0.0.1",
      "https://192.168.1.1","https://user:pw@company.org","https://company.org/private",
      "https://company.org?x=1","https://company.org:8443","https://company.org#frag",
      "https://company.org.evil.org@company.org"}){
      try{OriginPolicy.parse(url);fail("Accepted: "+url);}catch(IllegalArgumentException expected){}
    }
  }
  @Test public void externalSchemeAllowlist(){
    assertTrue(OriginPolicy.externalBrowserAllowed("https://external.example.org"));
    assertTrue(OriginPolicy.externalBrowserAllowed("mailto:help@company.org"));
    assertTrue(OriginPolicy.externalBrowserAllowed("tel:+5511999999999"));
    for(String url:new String[]{"javascript:alert(1)","intent://evil","file:///secret",
      "data:text/html,a","content://media/1","blob:https://a.org/abc",
      "https://user:pw@company.org"})
      assertFalse(OriginPolicy.externalBrowserAllowed(url));
  }
}
