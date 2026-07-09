import { useEffect, useRef } from 'react';

const SIMULATION_MS = 4000;
const INITIAL_LAYOUT = [
  { x: 0.24, y: 0.76, angle: -10 },
  { x: 0.38, y: 0.82, angle: 8 },
  { x: 0.52, y: 0.84, angle: -5 },
  { x: 0.66, y: 0.8, angle: 12 },
  { x: 0.78, y: 0.71, angle: -12 },
  { x: 0.47, y: 0.69, angle: 6 },
];

export default function CapsuleGlobe({
  capsules,
  isDrawing,
  className = '',
  dropColor,
}) {
  const globeRef = useRef(null);
  const rotorRef = useRef(null);
  const capsuleRefs = useRef([]);
  const globeClassName = [
    'machine-globe',
    isDrawing ? 'is-drawing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const visibleCapsules = capsules.slice(0, 6);
  const fallingCapsuleColor = dropColor ?? visibleCapsules[0]?.color ?? 'var(--yellow)';

  useEffect(() => {
    let animationFrame = null;

    function resetCapsules() {
      if (rotorRef.current) {
        rotorRef.current.style.transform = '';
      }

      capsuleRefs.current.forEach((capsule) => {
        if (capsule) {
          capsule.style.transform = `translate(-50%, -50%) rotate(${capsule.dataset.angle}deg)`;
        }
      });
    }

    if (!isDrawing) {
      resetCapsules();
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !globeRef.current || !rotorRef.current) {
      return resetCapsules;
    }

    const globeSize = globeRef.current.clientWidth;
    const center = globeSize / 2;
    const particles = capsuleRefs.current
      .slice(0, visibleCapsules.length)
      .filter(Boolean)
      .map((capsule, index) => {
        const layout = INITIAL_LAYOUT[index] ?? INITIAL_LAYOUT[0];
        const capsuleWidth = capsule.offsetWidth;
        const capsuleHeight = capsule.offsetHeight;
        const baseX = layout.x * globeSize;
        const baseY = layout.y * globeSize;
        const radius = Math.hypot(capsuleWidth, capsuleHeight) / 2;

        return {
          capsule,
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          vx: 24 - index * 8,
          vy: -12 + index * 9,
          angle: layout.angle,
          angularVelocity: (index % 2 === 0 ? 1 : -1) * (12 + index * 3),
          radius,
          restitution: 0.32 + index * 0.025,
          drag: 0.968 - index * 0.003,
          gravity: 250 + index * 12,
        };
      });

    let previousTime = performance.now();
    const startTime = previousTime;

    function keepInsideGlobe(particle) {
      const boundaryRadius = center - particle.radius - 8;
      const dx = particle.x - center;
      const dy = particle.y - center;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance <= boundaryRadius) {
        return;
      }

      const nx = dx / distance;
      const ny = dy / distance;
      const dot = particle.vx * nx + particle.vy * ny;

      particle.x = center + nx * boundaryRadius;
      particle.y = center + ny * boundaryRadius;

      if (dot > 0) {
        particle.vx -= (1 + particle.restitution) * dot * nx;
        particle.vy -= (1 + particle.restitution) * dot * ny;
        particle.angularVelocity += (particle.vx * ny - particle.vy * nx) * 0.12;
      }
    }

    function separateCapsules() {
      for (let index = 0; index < particles.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const first = particles[index];
          const second = particles[nextIndex];
          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.hypot(dx, dy) || 1;
          const minDistance = (first.radius + second.radius) * 0.72;

          if (distance >= minDistance) {
            continue;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = (minDistance - distance) / 2;
          const relativeVelocity = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;

          first.x -= nx * overlap;
          first.y -= ny * overlap;
          second.x += nx * overlap;
          second.y += ny * overlap;

          if (relativeVelocity < 0) {
            const impulse = relativeVelocity * -0.58;
            first.vx -= nx * impulse;
            first.vy -= ny * impulse;
            second.vx += nx * impulse;
            second.vy += ny * impulse;
            first.angularVelocity -= impulse * 0.1;
            second.angularVelocity += impulse * 0.1;
          }
        }
      }
    }

    function simulate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / SIMULATION_MS, 1);
      const easeOut = 1 - (1 - progress) ** 3;
      const rotorAngle = easeOut * 520;
      const boundaryRadius = center - 8;
      const rotorRadians = (rotorAngle * Math.PI) / 180;
      const gravityX = Math.sin(rotorRadians);
      const gravityY = Math.cos(rotorRadians);
      const dt = Math.min((time - previousTime) / 1000, 0.032);
      previousTime = time;

      rotorRef.current.style.transform = `rotate(${rotorAngle}deg)`;

      particles.forEach((particle, index) => {
        const dx = particle.x - center;
        const dy = particle.y - center;
        const distance = Math.hypot(dx, dy) || 1;
        const tangentX = -dy / distance;
        const tangentY = dx / distance;
        const contactDepth = distance + particle.radius - boundaryRadius;

        if (contactDepth > -6) {
          const contactStrength = Math.min(Math.max((contactDepth + 6) / 18, 0), 1);
          const outwardX = dx / distance;
          const outwardY = dy / distance;
          const spinStrength = (84 + index * 6) * contactStrength;
          const tumble = Math.sin(elapsed / (150 + index * 21)) * (22 + index * 3) * contactStrength;
          const liftPulse = Math.max(Math.sin(elapsed / 380 + index), 0) * 26 * contactStrength;

          particle.vx += (tangentX * spinStrength + outwardX * tumble) * dt;
          particle.vy += (tangentY * spinStrength + outwardY * tumble - liftPulse) * dt;
          particle.angularVelocity += spinStrength * 0.06 * dt;
        }

        particle.vx += gravityX * particle.gravity * dt;
        particle.vy += gravityY * particle.gravity * dt;
        particle.vx *= particle.drag;
        particle.vy *= particle.drag;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.angle += particle.angularVelocity * dt + (particle.vx * dt * 0.01);
        particle.angularVelocity *= 0.88;
      });

      separateCapsules();
      particles.forEach((particle) => {
        keepInsideGlobe(particle);
        particle.capsule.style.transform = [
          'translate(-50%, -50%)',
          `translate(${particle.x - particle.baseX}px, ${particle.y - particle.baseY}px)`,
          `rotate(${particle.angle}deg)`,
        ].join(' ');
      });

      if (elapsed < SIMULATION_MS) {
        animationFrame = window.requestAnimationFrame(simulate);
      }
    }

    animationFrame = window.requestAnimationFrame(simulate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      resetCapsules();
    };
  }, [isDrawing, visibleCapsules.length]);

  return (
    <div
      className={`capsule-globe-stage ${isDrawing ? 'is-drawing' : ''}`}
      style={{ '--drop-capsule-color': fallingCapsuleColor }}
      aria-hidden="true"
    >
      <div className={globeClassName} ref={globeRef}>
        <div className="machine-globe__rotor" ref={rotorRef}>
          <span className="machine-globe__spinner" />
          {visibleCapsules.map((capsule, index) => {
            const layout = INITIAL_LAYOUT[index] ?? INITIAL_LAYOUT[0];

            return (
              <span
                className="capsule"
                key={capsule.id}
                data-angle={layout.angle}
                ref={(node) => {
                  capsuleRefs.current[index] = node;
                }}
                style={{
                  '--capsule-color': capsule.color,
                  '--capsule-delay': `${index * 90}ms`,
                  '--capsule-x': `${layout.x * 100}%`,
                  '--capsule-y': `${layout.y * 100}%`,
                  '--capsule-angle': `${layout.angle}deg`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="exit-pipe">
        <span className="exit-pipe__shaft" />
        <span className="exit-pipe__lip" />
        <span className="drop-capsule" />
      </div>
    </div>
  );
}
