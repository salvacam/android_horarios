package com.pacv.roberf;

//import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.LinearLayout; 
import android.widget.Toast;

import org.apache.cordova.*;

public class roberf extends DroidGap {

	static final int CMD0_ACERCADE = 10;
	    
    public roberf(){
    	super();
    }
    
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
    
    
    public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, CMD0_ACERCADE, 0, "Acerca de...").setIcon(android.R.drawable.ic_menu_info_details);
        return true;
    }
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
        case CMD0_ACERCADE:
        	cmd0_acercade();
        	return true;
        }
        return false;
    }
    private void cmd0_acercade() {
    	String cad = "Consulta de los horarios de autobuses de Transportes Rober en Granada.";
    	AlertDialog alertDialog = new AlertDialog.Builder(this).create();
    	alertDialog.setTitle("Acerca de...");
    	alertDialog.setMessage( cad );
    	alertDialog.setButton("OK", new DialogInterface.OnClickListener() {  
    		public void onClick(DialogInterface dialog, int which) {  
    			return;  
    		} });
    	alertDialog.setIcon(R.drawable.icon);
    	alertDialog.show();    	
    }
    public boolean onPrepareOptionsMenu(Menu menu) {
    	MenuItem acercadeItem = menu.findItem(CMD0_ACERCADE);
    	acercadeItem.setEnabled(true);
    	return true;
    }
    
}
