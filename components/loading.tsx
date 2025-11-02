'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] w-screen flex items-center justify-center bg-white">
      <motion.div
        initial={false}
        animate={{ scale: 1, opacity: 1 }}
        exit={{scale: 0.6, opacity: 0}}
        transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 1 }}
        className="flex flex-col items-center justify-center gap-4 p-8"
      >
        {/* Logo */}
        <div className="items-center gap-x-2 flex">
          <Image
            src={'/logo.svg'}
            alt="logo"
            height={60}
            width={60}
            className="w-10 h-10 sm:w-16 sm:h-16 "
          />
          <p className="md:text-5xl font-bold  text-3xl  text-sky-400">
            Sentimeta
          </p>
        </div>
      </motion.div>
    </div>
  );
}
