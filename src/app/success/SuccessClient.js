'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Deer from "../components/Deer";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "succeeded") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    if (!session_id) {
      setStatus("no_intent");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/verify-payment?session_id=${session_id}`
        );
        const data = await res.json();
        if (data.ok && data.status === "succeeded") {
          setStatus("succeeded");
          setInfo(data);
        } else {
          setStatus("failed");
          setInfo(data);
        }
      } catch (err) {
        setStatus("error");
        setInfo({ message: err.message });
      }
    }

    verify();
  }, [searchParams]);

  if (status === "verifying")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf7f1] via-[#f5efe3] to-[#e8dec8] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-white/70 px-8 py-10 text-center">
          <Image
            src="/NORYA-logo.png"
            alt="Norya"
            width={170}
            height={170}
            priority
            className="mx-auto mb-6 h-auto w-[170px]"
          />
          <p className="text-lg font-medium text-[#2d2a26]">
            Verifiserer betaling...
          </p>
        </div>
      </div>
    );

  if (status === "no_intent")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf7f1] via-[#f5efe3] to-[#e8dec8] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-white/70 px-8 py-10 text-center">
          <Image
            src="/NORYA-logo.png"
            alt="Norya"
            width={170}
            height={170}
            priority
            className="mx-auto mb-6 h-auto w-[170px]"
          />
          <p className="text-lg font-semibold text-[#2d2a26]">
            Fant ingen betaling å bekrefte.
          </p>
        </div>
      </div>
    );

  const showModel = status === "succeeded";
  const consignmentNumber = info?.consignmentNumber || null;
  const trackingUrl = consignmentNumber
    ? `https://sporing.posten.no/sporing/${encodeURIComponent(consignmentNumber)}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f1] via-[#f5efe3] to-[#e8dec8] flex items-center justify-center p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 py-3 sm:py-5">
        <div className="flex items-center justify-center">
          <div className="relative h-28 w-28">
            <Image
              src="/NORYA-logo.png"
              alt="Norya"
              fill
              priority
              sizes="112px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center justify-items-center gap-5 lg:grid-cols-2 lg:gap-8">
          {status === "succeeded" ? (
            <div className="w-full max-w-lg text-center">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8a7b58]">
                Ordrebekreftelse
              </p>
              <h1 className="mb-2 text-2xl font-semibold text-[#2f2a23] sm:text-3xl">
                Betalingen var vellykket
              </h1>
              <p className="text-sm leading-6 text-[#5f5543] sm:text-base">
                Takk for kjøpet ditt. Bestillingen din er bekreftet og blir
                sendt snart.
              </p>

              {consignmentNumber ? (
                <div className="mx-auto mt-5 w-full max-w-lg space-y-3 text-left">
                  <div className="border-t border-[#d9d2c5] pt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#8a7b58]">
                      Din sporing
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="font-mono text-base font-semibold text-[#2f2a23] sm:text-lg">
                        {consignmentNumber}
                      </p>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(consignmentNumber);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="border border-[#d9d2c5] px-3 py-1.5 text-xs font-medium text-[#5f5543] transition-colors hover:bg-white/60"
                      >
                        {copied ? "Kopiert!" : "Kopier"}
                      </button>
                    </div>
                  </div>
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-[#2f2a23] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#2f2a23]/80"
                  >
                    Spoor bestillingen
                  </a>
                  <p className="text-center text-sm text-[#5f5543]">
                    En ordrebekreftelse med sporingsinformasjon er sendt til e-posten din.
                  </p>
                </div>
              ) : (
                <div className="mx-auto mt-5 w-full max-w-lg space-y-3">
                  <div className="border-t border-[#d9d2c5] pt-3 text-left">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#8a7b58]">
                      Sporing
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#5f5543]">
                      Bestillingen din er registrert og en sporingskode vil bli sendt til e-posten din så snart pakken er pakket og sendt.
                    </p>
                  </div>
                  <p className="text-center text-xs text-[#5f5543]">
                    Du vil bli omdirigert til forsiden om noen sekunder...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.18em] text-[#8a7b58]">
                Ordrebekreftelse
              </p>
              <h1 className="mb-3 text-3xl font-semibold text-[#2f2a23] sm:text-4xl">
                Payment {status}
              </h1>
              <pre className="max-w-2xl overflow-auto rounded bg-[#fff7f4] p-4 text-left text-sm text-[#4a2d28]">
                {JSON.stringify(info, null, 2)}
              </pre>
            </div>
          )}

          <div className="w-full max-w-xl">
            <div className="relative h-[340px] w-full sm:h-[390px]">
              <Canvas
                camera={{
                  position: [100, 2, 100],
                  fov: 50,
                  near: 0.1,
                  far: 1000,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  display: "block",
                }}
                frameloop="always"
                gl={{
                  preserveDrawingBuffer: true,
                  antialias: true,
                }}
                onCreated={({ gl }) => {
                  const canvas = gl.domElement;
                  const handleContextLost = (event) => {
                    event.preventDefault();
                    console.warn("WebGL context lost");
                  };
                  const handleContextRestored = () => {
                    console.log("WebGL context restored");
                  };
                  canvas.addEventListener(
                    "webglcontextlost",
                    handleContextLost,
                    false
                  );
                  canvas.addEventListener(
                    "webglcontextrestored",
                    handleContextRestored,
                    false
                  );
                }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={4.2}
                  castShadow
                />
                <directionalLight
                  position={[18, -8, -9]}
                  intensity={2.8}
                />
                <spotLight
                  position={[0, -2, 0]}
                  angle={0.5}
                  penumbra={1}
                  intensity={1.4}
                  color="#ffffff"
                  castShadow
                />
                {showModel && (
                  <Deer
                    position={[0, 0, 0]}
                    scale={0.28}
                    modelPath="/models/deer/scene.gltf"
                  />
                )}
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  enableRotate={true}
                  target={[0, 0, 0]}
                />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
