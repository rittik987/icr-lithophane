"use client";

import { useEffect, useRef, useState } from "react";
import { makeLithophaneLooks } from "@/lib/lampLooks";

interface LampViewerProps {
  imageUrl: string;
  lit: boolean;
}

export default function LampViewer({ imageUrl, lit }: LampViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    rotX: number;
    rotY: number;
  } | null>(null);
  const rotRef = useRef({ x: 12, y: -22 });
  const [rot, setRot] = useState({ x: 12, y: -22 });
  const [looks, setLooks] = useState<{ day: string; night: string } | null>(null);
  const [width, setWidth] = useState(280);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let gone = false;
    setLooks(null);
    makeLithophaneLooks(imageUrl)
      .then((next) => {
        if (!gone) setLooks(next);
      })
      .catch(() => {
        if (!gone) setLooks({ day: imageUrl, night: imageUrl });
      });
    return () => {
      gone = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    function measure() {
      if (stageRef.current) setWidth(stageRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    rotRef.current = rot;
  }, [rot]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotX: rotRef.current.x,
      rotY: rotRef.current.y,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setRot({
      x: Math.max(-30, Math.min(30, drag.rotX - (event.clientY - drag.y) * 0.28)),
      y: drag.rotY + (event.clientX - drag.x) * 0.35,
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }

  const lampW = Math.min(width * 0.8, 348);
  const lampH = lampW * 0.75;
  const lampD = lampW * 0.16;
  const lip = Math.max(16, lampW * 0.078);
  const pane = looks ? (lit ? looks.night : looks.day) : "";
  const hideBack = { backfaceVisibility: "hidden" as const };

  return (
    <div
      ref={stageRef}
      className="relative w-full overflow-hidden rounded-sm"
      style={{
        height: Math.max(320, lampH + 96),
        touchAction: "none",
      }}
    >
      <div className="absolute inset-0" style={{ background: "#d6d0c7" }} />
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Turn the lamp to see the wooden frame"
        style={{ perspective: 960, cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="relative"
          style={{
            width: lampW,
            height: lampH,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: dragging ? "none" : "transform 180ms ease-out",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              ...hideBack,
              transform: `translateZ(${lampD / 2}px)`,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                top: lip,
                right: lip,
                bottom: lip,
                left: lip,
                boxShadow: lit ? "0 0 18px 3px rgba(242, 196, 110, 0.28)" : undefined,
              }}
            >
              {pane ? (
                <img
                  src={pane}
                  alt="Your photo on the lamp"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-[#f3efe8]" />
              )}
            </div>

            <div
              className="icr-laminate absolute left-0 top-0 w-full"
              style={{
                height: lip,
                clipPath: `polygon(0 0, 100% 0, calc(100% - ${lip}px) 100%, ${lip}px 100%)`,
                boxShadow: "inset 0 1px 0 rgba(255,220,180,0.18)",
              }}
            />
            <div
              className="icr-laminate-v absolute top-0 right-0 h-full"
              style={{
                width: lip,
                clipPath: `polygon(0 ${lip}px, 100% 0, 100% 100%, 0 calc(100% - ${lip}px))`,
              }}
            />
            <div
              className="icr-laminate absolute left-0 bottom-0 w-full"
              style={{
                height: lip,
                clipPath: `polygon(${lip}px 0, calc(100% - ${lip}px) 0, 100% 100%, 0 100%)`,
              }}
            />
            <div
              className="icr-laminate-v absolute top-0 left-0 h-full"
              style={{
                width: lip,
                clipPath: `polygon(0 0, 100% ${lip}px, 100% calc(100% - ${lip}px), 0 100%)`,
              }}
            />
          </div>

          <div
            className="icr-laminate absolute"
            style={{
              ...hideBack,
              width: lampW,
              height: lampH,
              transform: `rotateY(180deg) translateZ(${lampD / 2}px)`,
            }}
          />

          <div
            className="icr-laminate-v absolute"
            style={{
              ...hideBack,
              width: lampD,
              height: lampH,
              left: (lampW - lampD) / 2,
              transform: `rotateY(-90deg) translateZ(${lampW / 2}px)`,
            }}
          />
          <div
            className="icr-laminate-v absolute"
            style={{
              ...hideBack,
              width: lampD,
              height: lampH,
              left: (lampW - lampD) / 2,
              transform: `rotateY(90deg) translateZ(${lampW / 2}px)`,
            }}
          />
          <div
            className="icr-laminate absolute"
            style={{
              ...hideBack,
              width: lampW,
              height: lampD,
              top: (lampH - lampD) / 2,
              transform: `rotateX(90deg) translateZ(${lampH / 2}px)`,
            }}
          />
          <div
            className="icr-laminate absolute"
            style={{
              ...hideBack,
              width: lampW,
              height: lampD,
              top: (lampH - lampD) / 2,
              transform: `rotateX(-90deg) translateZ(${lampH / 2}px)`,
            }}
          />
        </div>
      </div>

      {!looks && (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13px] font-sans text-[#6e5c50]">
          Making your lamp…
        </p>
      )}
    </div>
  );
}
