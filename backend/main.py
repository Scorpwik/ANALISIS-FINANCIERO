from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import sqlite3
import google.generativeai as genai
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("nexus.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolio_tx (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount_usd REAL,
            spy_price REAL,
            shares REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

class AIRequest(BaseModel):
    api_key: str
    price: float
    rsi: float = 0
    trend: str = "Neutral"
    trades: list = [] # Para que la IA analice operaciones abiertas

@app.get("/api/market/gold")
def get_gold_data(interval: str = "15m", period: str = "5d"):
    try:
        ticker = yf.Ticker("GC=F")
        df = ticker.history(period=period, interval=interval)
        
        data = []
        for index, row in df.iterrows():
            data.append({
                "time": int(index.timestamp()),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "value": row["Volume"] # Necesario para el Volume Histogram en frontend
            })
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/spy")
def get_spy_data():
    try:
        ticker = yf.Ticker("SPY")
        df = ticker.history(period="1d", interval="1m")
        if not df.empty:
            price = df["Close"].iloc[-1]
            return {"price": price}
        else:
            return {"price": 510.50} 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/spy/history")
def get_spy_history(interval: str = "15m", period: str = "5d"):
    try:
        ticker = yf.Ticker("SPY")
        df = ticker.history(period=period, interval=interval)
        data = []
        for index, row in df.iterrows():
            data.append({
                "time": int(index.timestamp()),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "value": row["Volume"] 
            })
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/analyze")
def analyze_market(req: AIRequest):
    try:
        if not req.api_key:
            raise HTTPException(status_code=400, detail="Missing API Key")
        
        genai.configure(api_key=req.api_key)
        
        # Lista de modelos a probar por orden de prioridad
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-pro-latest',
            'gemini-1.5-flash',
            'gemini-pro'
        ]
        
        last_error = ""
        for model_name in models_to_try:
            try:
                print(f"DEBUG: Probando modelo {model_name}...")
                model = genai.GenerativeModel(model_name)
                
                # Prompt mejorado y ultra completo
                prompt = f"""
                Actúa como un Analista Quant de Grado Institucional.
                DATOS ACTUALES ORO (XAU/USD):
                - Precio: ${req.price}
                - RSI: {req.rsi}
                - Tendencia Técnica: {req.trend}
                
                OPERACIONES ABIERTAS DEL USUARIO:
                {req.trades if req.trades else "Sin operaciones abiertas."}
                
                TAREA:
                1. Analiza si la estructura actual favorece las operaciones abiertas.
                2. Da una recomendación táctica inmediata (Hold, Close, BE, Add).
                3. Explica el porqué basado en liquidez y niveles técnicos.
                
                RESPUESTA:
                Usa formato HTML profesional con <b>, <br> y colores CSS en línea si es necesario. Máximo 100 palabras.
                """
                
                response = model.generate_content(prompt)
                
                print(f"✅ ¡Éxito con el modelo {model_name}!")
                return {"summary": response.text}
            except Exception as e:
                last_error = str(e)
                print(f"❌ Fallo en {model_name}: {last_error[:50]}...")
                continue
        
        # Si llegamos aquí, todos fallaron
        raise HTTPException(status_code=500, detail=f"Todos los modelos agotados o sin acceso. Último error: {last_error}")
    except Exception as e:
        print(f"DEBUG CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
