import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Zap } from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate  = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div style={{height:"100vh",display:"flex",fontFamily:"'Inter',sans-serif"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        @keyframes spin{to{transform:rotate(360deg)}}

        .input {
          width:100%;
          padding:14px 16px 14px 44px;
          border-radius:12px;
          border:1.5px solid #e5e7eb;
          background:#f9fafb;
          font-size:14px;
          transition:0.2s;
        }
        .input:focus{
          outline:none;
          border-color:#7c3aed;
          background:white;
          box-shadow:0 0 0 3px rgba(124,58,237,0.08);
        }

        .icon {
          position:absolute;
          left:14px;
          top:50%;
          transform:translateY(-50%);
          color:#a78bfa;
        }

        .btn {
          width:100%;
          padding:14px;
          border:none;
          border-radius:14px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:white;
          font-weight:600;
          font-size:15px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          transition:0.2s;
          box-shadow:0 6px 20px rgba(99,102,241,0.4);
        }
        .btn:hover{transform:translateY(-1px)}
      `}</style>

      {/* LEFT SIDE */}
      <div style={{
        flex:1,
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"linear-gradient(180deg,#f8fafc,#eef2ff)"
      }}>

        {/* LOGO */}
        <div style={{
          position:"absolute",
          top:25,
          left:40,
          display:"flex",
          alignItems:"center",
          gap:10
        }}>
          <div style={{
            width:36,height:36,borderRadius:10,
            background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            display:"flex",alignItems:"center",justifyContent:"center"
          }}>
            <Zap size={18} color="white"/>
          </div>
          <span style={{
            fontFamily:"Syne",
            fontWeight:800,
            fontSize:18
          }}>
            SkillSwap
          </span>
        </div>

        {/* GLASS CARD */}
        <div style={{
          width:"100%",
          maxWidth:380,
          padding:30,
          borderRadius:20,
          background:"rgba(255,255,255,0.85)",
          backdropFilter:"blur(12px)",
          boxShadow:"0 15px 40px rgba(0,0,0,0.08)"
        }}>

          <h1 style={{
            fontFamily:"Syne",
            fontSize:26,
            fontWeight:800,
            marginBottom:6,
            color:"#111827"
          }}>
            Continue your skill journey
          </h1>

          <p style={{
            fontSize:14,
            color:"#6b7280",
            marginBottom:22
          }}>
            Learn, connect and grow with the community
          </p>

          {error && (
            <div style={{
              marginBottom:14,
              padding:"10px",
              borderRadius:10,
              background:"#fee2e2",
              color:"#dc2626",
              fontSize:13
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div style={{marginBottom:12}}>
              <div style={{position:"relative"}}>
                <Mail size={16} className="icon"/>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="Email address"
                  className="input"
                />
              </div>
            </div>

            <div style={{marginBottom:10}}>
              <div style={{position:"relative"}}>
                <Lock size={16} className="icon"/>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Password"
                  className="input"
                />
              </div>
            </div>

            {/* ✅ UPDATED: Forgot password now navigates to /forgot-password */}
            <div style={{
              textAlign:"right",
              marginBottom:18,
            }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize:12,
                  color:"#7c3aed",
                  textDecoration:"none",
                  fontWeight:500
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading
                ? <span style={{
                    width:16,height:16,
                    border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white",
                    borderRadius:"50%",
                    animation:"spin 0.6s linear infinite"
                  }}/>
                : <>Continue <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <p style={{
            marginTop:18,
            fontSize:13,
            textAlign:"center",
            color:"#6b7280"
          }}>
            New here?{" "}
            <Link to="/signup" style={{color:"#7c3aed",fontWeight:600}}>
              Create account
            </Link>
          </p>

          <p style={{
            marginTop:10,
            fontSize:11,
            textAlign:"center",
            color:"#9ca3af"
          }}>
            Trusted by 10,000+ learners 🌍
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (UNCHANGED) */}
      <div style={{
        flex:1,
        position:"relative",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        background:"linear-gradient(135deg,#6366f1,#8b5cf6)"
      }}>

        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt=""
          style={{
            position:"absolute",
            width:"100%",
            height:"100%",
            objectFit:"cover",
            opacity:0.25
          }}
        />

        <div style={{
          position:"relative",
          zIndex:1,
          maxWidth:320,
          textAlign:"center"
        }}>
          <h2 style={{
            fontFamily:"Syne",
            fontSize:28,
            color:"white",
            marginBottom:12
          }}>
            Learn. Share. Grow 🚀
          </h2>

          <p style={{
            color:"rgba(255,255,255,0.85)",
            fontSize:14,
            marginBottom:24
          }}>
            Build real-world skills by connecting with others
          </p>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.15)",padding:12,borderRadius:10,color:"white"}}>
              👥 12K+ Active Users
            </div>
            <div style={{background:"rgba(255,255,255,0.15)",padding:12,borderRadius:10,color:"white"}}>
              ⭐ 4.9 Rating
            </div>
            <div style={{background:"rgba(255,255,255,0.15)",padding:12,borderRadius:10,color:"white"}}>
              ⚡ 48K Skills Shared
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}