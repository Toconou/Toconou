package com.toconou.superapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { ToconouSuperApp() }
    }
}

@Composable
fun ToconouSuperApp() {
    var page by remember { mutableStateOf("Toconou Pay") } // page actuelle

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF1A1A1A)){
                NavigationBarItem(selected = page=="Discussions", onClick = {page="Discussions"}, icon = {}, label = {Text("Discussions", fontFamily = FontFamily.SansSerif)})
                NavigationBarItem(selected = page=="Découvrir", onClick = {page="Découvrir"}, icon = {}, label = {Text("Découvrir", fontFamily = FontFamily.SansSerif)})
                NavigationBarItem(selected = page=="Toconou Pay", onClick = {page="Toconou Pay"}, icon = {}, label = {Text("Portefeuille", fontFamily = FontFamily.SansSerif)})
                NavigationBarItem(selected = page=="Moi", onClick = {page="Moi"}, icon = {}, label = {Text("Moi", fontFamily = FontFamily.SansSerif)})
            }
        }
    ){ padding ->
        Box(Modifier.padding(padding).background(Color(0xFF121212)).fillMaxSize()){
            when(page){
                "Discussions" -> ToconouDiscussions()
                "Découvrir" -> ToconouDecouvrir()
                "Toconou Pay" -> ToconouPayModule() // MODULE PAIEMENT DEDANS
                "Moi" -> ToconouMoi()
            }
        }
    }
}

@Composable
fun ToconouPayModule(){
    var montant by remember { mutableStateOf("") }
    var valide by remember { mutableStateOf(false) }
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)){
        Text("Toconou Pay", color = Color(0xFFD4AF37), fontSize = 24.sp, fontFamily = FontFamily.SansSerif)
        Text("Service de paiement de Toconou - Propulsé par Fedapay", color = Color.Gray, fontFamily = FontFamily.SansSerif)
        Text("Solde: 0 F CFA", color = Color.White, fontFamily = FontFamily.SansSerif)
        Text("Encaissez via USSD", color = Color.White, fontSize = 20.sp, fontFamily = FontFamily.SansSerif)
        Text("Code: *601*14*50938*${if(montant.isEmpty()) "montant" else montant}#", color = Color(0xFFD4AF37), fontFamily = FontFamily.SansSerif)
        OutlinedTextField(value = montant, onValueChange = {montant=it}, label = {Text("Montant (ex: 5000) - Pas de prix fixe", fontFamily = FontFamily.SansSerif)}, modifier = Modifier.fillMaxWidth())
        Button(onClick = { valide=true }, colors = ButtonDefaults.buttonColors(Color(0xFF1B5E20)), modifier = Modifier.fillMaxWidth().height(56.dp)){
            Text("Valider le paiement", color = Color.White, fontFamily = FontFamily.SansSerif)
        }
        if(valide){
            Text("Paiement validé! Transaction réussie", color = Color(0xFF1B5E20), fontFamily = FontFamily.SansSerif)
            Text("Retour", color = Color.White, fontFamily = FontFamily.SansSerif)
        }
    }
}

@Composable fun ToconouDiscussions(){ Box(Modifier.padding(16.dp)){ Text("Discussions Toconou - Chat", color = Color.White, fontFamily = FontFamily.SansSerif) } }
@Composable fun ToconouDecouvrir(){ Box(Modifier.padding(16.dp)){ Text("Découvrir - Marché, Services", color = Color.White, fontFamily = FontFamily.SansSerif) } }
@Composable fun ToconouMoi(){ Box(Modifier.padding(16.dp)){ Text("Moi - Profil", color = Color.White, fontFamily = FontFamily.SansSerif) } }
