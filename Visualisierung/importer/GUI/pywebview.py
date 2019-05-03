import webview
import time

webview.create_window("It works, Jim!", "http://www.google.com")
webview.getSettings().setJavaScriptEnabled(true);
time.sleep(2)
webview.execute_script("alert('123');")

webview.loadUrl("javascript:testEcho('Hello World!')");