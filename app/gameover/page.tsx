"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
    const router=useRouter()
  return (
    <div
        style={{
            width:"100vw",
            height:"100vh",
            backgroundColor:"black",
            color:"white",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            flexDirection:"column"
        }}
    >
        <div style={{fontSize:30}}>Game over!</div>
        <div
            style={{
                padding: "10px 20px",
                backgroundColor: "#ff6666",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1.5rem",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: "scale(1)",
                boxShadow: "0px 4px 15px rgba(255, 102, 102, 0.5)",
                animation: "shake 0.8s ease-in-out infinite",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0px 6px 20px rgba(255, 102, 102, 0.7)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0px 4px 15px rgba(255, 102, 102, 0.5)";
            }}
            onClick={()=>{
                router.push("/game")
            }}
        >
            Restart
        </div>

        <style jsx>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-5px); }
            }
        `}</style>
    </div>
  );
}
