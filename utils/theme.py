import streamlit as st

def apply_theme():
    st.markdown("""
        <style>
        /* Base App Styling */
        .stApp {
            background-color: #0A0E1A;
            background-image: radial-gradient(circle at 15% 50%, rgba(0, 212, 170, 0.05), transparent 25%),
                              radial-gradient(circle at 85% 30%, rgba(124, 92, 252, 0.05), transparent 25%);
        }
        
        /* Headers */
        h1, h2, h3 {
            font-family: 'Inter', sans-serif !important;
            color: #FFFFFF !important;
        }
        
        h1 {
            font-weight: 700;
            background: linear-gradient(90deg, #00D4AA 0%, #7C5CFC 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem !important;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #9CA3AF;
            margin-bottom: 2rem;
        }

        /* Glassmorphic Cards */
        .st-emotion-cache-16txtl3 { /* Typically the container for metrics or general divs */
            background-color: rgba(26, 31, 46, 0.6) !important;
            border: 1px solid rgba(0, 212, 170, 0.15) !important;
            border-radius: 12px !important;
            padding: 1.5rem !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }
        
        .st-emotion-cache-16txtl3:hover {
            border-color: rgba(0, 212, 170, 0.4) !important;
            box-shadow: 0 8px 15px rgba(0, 212, 170, 0.1);
            transform: translateY(-2px);
        }

        /* Metrics */
        div[data-testid="stMetricValue"] {
            font-size: 2rem !important;
            font-weight: 600 !important;
            color: #FFFFFF !important;
        }
        div[data-testid="stMetricLabel"] {
            font-size: 1rem !important;
            color: #9CA3AF !important;
        }
        
        /* Sidebar styling */
        section[data-testid="stSidebar"] {
            background-color: #111827 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Buttons */
        .stButton>button {
            background: linear-gradient(135deg, #00D4AA 0%, #00B392 100%) !important;
            color: #111827 !important;
            font-weight: 600 !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 0.75rem 2rem !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 10px rgba(0, 212, 170, 0.2) !important;
        }
        
        .stButton>button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 15px rgba(0, 212, 170, 0.3) !important;
            background: linear-gradient(135deg, #00EDBE 0%, #00B392 100%) !important;
        }
        
        /* Feature Grid styling */
        .feature-box {
            background: rgba(26, 31, 46, 0.6);
            border: 1px solid rgba(124, 92, 252, 0.15);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            height: 100%;
        }
        .feature-box h3 {
            color: #E0E0E0 !important;
            margin-top: 1rem;
            font-size: 1.25rem;
        }
        .feature-box p {
            color: #9CA3AF;
            font-size: 0.95rem;
        }
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        </style>
    """, unsafe_allow_html=True)
