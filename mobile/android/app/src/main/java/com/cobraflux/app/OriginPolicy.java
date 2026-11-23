package com.cobraflux.app;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.regex.Pattern;

/** Fail-closed HTTPS origin allowlist; no DNS, JavaScript bridge or externally supplied URL. */
public final class OriginPolicy {
  private static final Pattern PUBLIC = Pattern.compile("^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,63}$");
  private final String host;
  private final String origin;
  private OriginPolicy(String host) { this.host = host; this.origin = "https://" + host; }
  public static OriginPolicy parse(String raw) {
    if(raw == null || raw.isEmpty() || !raw.equals(raw.trim()))
      throw new IllegalArgumentException("Explicit HTTPS staging origin required");
    try {
      URI uri = new URI(raw);
      String h = uri.getHost();
      if(!"https".equals(uri.getScheme()) || h == null || uri.getRawUserInfo()!=null ||
          uri.getPort()!=-1 || uri.getRawQuery()!=null || uri.getRawFragment()!=null)
        throw new IllegalArgumentException("Unsafe origin");
      h = h.toLowerCase(Locale.ROOT);
      if(!PUBLIC.matcher(h).matches() || h.contains("..") || h.endsWith(".localhost") ||
          h.endsWith(".local") || h.endsWith(".invalid") || h.endsWith(".test") ||
          h.equals("localhost") || h.matches("^[0-9.]+$"))
        throw new IllegalArgumentException("Nonpublic origin");
      if(!raw.equals("https://"+h) && !raw.equals("https://"+h+"/"))
        throw new IllegalArgumentException("Noncanonical origin");
      return new OriginPolicy(h);
    } catch(URISyntaxException error) {throw new IllegalArgumentException("Invalid origin",error);}
  }
  public String initialUrl(){return origin+"/";}
  public boolean isFirstParty(String address){
    if(address==null)return false;
    try {
      URI u=new URI(address);
      return "https".equals(u.getScheme()) && u.getPort()==-1 &&
        u.getRawUserInfo()==null && u.getHost()!=null &&
        host.equals(u.getHost().toLowerCase(Locale.ROOT));
    }catch(URISyntaxException err){return false;}
  }
  public static boolean externalBrowserAllowed(String address){
    if(address==null)return false;
    try {
      URI u=new URI(address);
      if(u.getScheme()==null || u.getRawUserInfo()!=null)return false;
      String scheme=u.getScheme().toLowerCase(Locale.ROOT);
      if("https".equals(scheme) || "http".equals(scheme))return u.getHost()!=null;
      return ("mailto".equals(scheme)||"tel".equals(scheme)) &&
        u.getRawSchemeSpecificPart()!=null;
    }catch(URISyntaxException err){return false;}
  }
}
