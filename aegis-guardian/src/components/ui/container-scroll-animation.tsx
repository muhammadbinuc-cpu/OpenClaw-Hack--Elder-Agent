import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="h-[45rem] md:h-[60rem] flex items-start justify-center relative p-2 md:p-8" ref={containerRef}>
      <div className="py-6 md:py-12 w-full relative" style={{ perspective: "1000px" }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => (
  <motion.div style={{ translateY: translate }} className="max-w-5xl mx-auto text-center">
    {titleComponent}
  </motion.div>
);

export const Card = ({ rotate, scale, children }: { rotate: MotionValue<number>; scale: MotionValue<number>; translate: MotionValue<number>; children: React.ReactNode }) => (
  <motion.div
    style={{ rotateX: rotate, scale, boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026" }}
    className="max-w-5xl -mt-12 mx-auto w-full border-4 border-[#1f1f1f] p-2 md:p-6 bg-[#111111] rounded-[30px] shadow-2xl"
  >
    <div className="w-full overflow-hidden rounded-2xl bg-[#0f0f0f] md:rounded-2xl md:p-4">
      {children}
    </div>
  </motion.div>
);
