import streamlit as st
from utils.theme import apply_theme

# Page Config must be the first Streamlit command
st.set_page_config(
    page_title="CareFlow AI",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Apply custom dark theme CSS
apply_theme()

# --- HERO SECTION ---
st.markdown("<h1>CareFlow AI</h1>", unsafe_allow_html=True)
st.markdown("<p class='subtitle'>Next-Generation Healthcare Intelligence Platform</p>", unsafe_allow_html=True)

st.write("Welcome to the future of clinical decision support. CareFlow AI integrates advanced machine learning with a seamless, medical-grade interface to empower healthcare professionals.")

st.markdown("<br>", unsafe_allow_html=True)

col1, col2, col3 = st.columns([1, 1, 1.5])
with col1:
    if st.button("Explore Dashboard Demo"):
        st.toast("Dashboard demo coming soon in next phase!", icon="🚀")
with col2:
    if st.button("Learn More"):
         st.toast("Documentation coming soon!", icon="📚")

st.markdown("<br><br>", unsafe_allow_html=True)

# --- SYSTEM METRICS (MOCK) ---
st.subheader("Platform Capabilities Overview")
st.markdown("<br>", unsafe_allow_html=True)

m1, m2, m3, m4 = st.columns(4)

with m1:
    st.metric(label="Inference Speed", value="< 150ms", delta="-12ms vs avg")
with m2:
    st.metric(label="Model Accuracy", value="99.2%", delta="Top 1% Tier")
with m3:
    st.metric(label="Active Pipelines", value="4", delta="Operational", delta_color="normal")
with m4:
    st.metric(label="Compliance", value="HIPAA Ready", delta="Encrypted & Audited", delta_color="normal")

st.markdown("<br><br>", unsafe_allow_html=True)

# --- FEATURES GRID ---
st.subheader("Core Modules")
st.markdown("<br>", unsafe_allow_html=True)

f1, f2, f3, f4 = st.columns(4)

with f1:
    st.markdown("""
        <div class="feature-box">
            <div class="feature-icon">🏥</div>
            <h3>Patient Management</h3>
            <p>Smart triaging, real-time vitals monitoring, and predictive risk scoring.</p>
        </div>
    """, unsafe_allow_html=True)

with f2:
    st.markdown("""
        <div class="feature-box">
            <div class="feature-icon">🧠</div>
            <h3>Medical Imaging AI</h3>
            <p>Automated anomaly detection in X-Rays and MRIs with heatmap overlays.</p>
        </div>
    """, unsafe_allow_html=True)

with f3:
    st.markdown("""
        <div class="feature-box">
            <div class="feature-icon">📊</div>
            <h3>Clinical Analytics</h3>
            <p>Department-wide resource optimization and predictive patient flow.</p>
        </div>
    """, unsafe_allow_html=True)

with f4:
    st.markdown("""
        <div class="feature-box">
            <div class="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>NLP-powered clinical documentation and contextual literature search.</p>
        </div>
    """, unsafe_allow_html=True)

st.markdown("<br><br>", unsafe_allow_html=True)

# --- FOOTER ---
st.markdown("""
    <hr style="border-color: rgba(255,255,255,0.1); margin-top: 3rem; margin-bottom: 2rem;">
    <div style="text-align: center; color: #6B7280; font-size: 0.85rem;">
        <p>CareFlow AI MVP Prototype.</p>
        <p><i>Note: This is a front-end UI demonstration. Backend services and ML inference modules are currently offline.</i></p>
    </div>
""", unsafe_allow_html=True)
