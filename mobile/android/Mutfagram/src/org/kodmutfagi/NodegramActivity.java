package org.kodmutfagi;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class NodegramActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadUrl("file:///android_asset/www/index.html");
    }
  
}
