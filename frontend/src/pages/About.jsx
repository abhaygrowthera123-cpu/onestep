import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, Target, Rocket, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';
import { resolveImageUrl } from '../lib/imageUrl';
export const About = () => {
    return (<div className="space-y-24 pb-20">
      <SEO title="About Us" description="Learn more about Onestep-Hub, a technology-driven fashion marketplace connecting manufacturers, wholesalers, and retailers."/>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={resolveImageUrl('/uploads/images/about-hero.jpg')} alt="About Us" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80"/>
        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center space-x-3 bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 text-blue-500 text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-[0.4em]">
            <span>Our Heritage</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase break-words">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 font-serif">Onestep-Hub</span>
          </motion.h1>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-50 p-12 rounded-[3rem] space-y-6">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-200">
            <Target className="h-8 w-8"/>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Mission</h2>
          <p className="text-slate-600 font-medium leading-relaxed text-lg">
            To simplify B2B procurement by providing a unified platform that connects buyers and suppliers, enabling efficient product discovery, transparent pricing, and seamless bulk transactions across multiple categories.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-12 rounded-[3rem] space-y-6 text-white">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-white/10">
            <Rocket className="h-8 w-8"/>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Our Vision</h2>
          <p className="text-slate-300 font-medium leading-relaxed text-lg">
            To become a leading multi-category B2B digital marketplace by transforming traditional supply chain systems through technology, transparency, and efficiency.
          </p>
        </motion.div>
      </section>

      {/* Problem We Solve */}
      <section className="max-w-7xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">The Problem We Solve</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Addressing the unorganized and fragmented supply chain in fashion, footwear, and lifestyle sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
                title: "Limited Access",
                desc: "Limited direct access to manufacturers forces businesses to depend on multiple intermediaries.",
                icon: Users
            },
            {
                title: "Opaque Pricing",
                desc: "Lack of transparent and standardized pricing creates confusion and leads to higher costs.",
                icon: ShieldCheck
            },
            {
                title: "Fragmented Sourcing",
                desc: "Absence of a unified multi-category platform makes sourcing fragmented and inefficient.",
                icon: Globe
            }
        ].map((item, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="p-10 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200 transition-all group">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all mb-6">
                <item.icon className="h-6 w-6"/>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>))}
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-slate-950 py-24 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none break-words">
                Key <span className="text-brand-500">Features</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg max-w-lg">
                Our platform is designed to streamline your business operations and maximize profitability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
            { title: "Direct Access", desc: "Connect directly with manufacturers." },
            { title: "Transparent Pricing", desc: "Clear and competitive pricing." },
            { title: "Bulk Management", desc: "Structured bulk ordering system." },
            { title: "Multi-Category", desc: "Wide range of product segments." }
        ].map((feature, i) => (<div key={i} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"/>
                    <h4 className="font-black uppercase tracking-widest text-sm">{feature.title}</h4>
                  </div>
                  <p className="text-slate-500 text-sm font-medium pl-5">{feature.desc}</p>
                </div>))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-20 bg-brand-600/20 blur-[100px] rounded-full"/>
            <img src={resolveImageUrl('/uploads/images/about-tech.jpg')} alt="Technology" className="relative rounded-[3rem] shadow-2xl border border-white/10" referrerPolicy="no-referrer"/>
          </div>
        </div>
      </section>

      {/* Promoters */}
      <section className="max-w-7xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">Our Leadership</h2>
          <p className="text-slate-500 font-medium font-serif italic">The visionaries behind Onestep-Hub.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {[
            { 
              name: "Mr. Budde Harivardhan", 
              role: "Founder & Director", 
              desc: "Strategic Planning & Business Development",
              image: "/uploads/images/founder-hari.png"
            },
            { 
              name: "Mrs. Budde Mamatha", 
              role: "Co-Founder & Director", 
              desc: "Operations & Administration",
              image: "/uploads/images/founder-mamatha.png"
            }
        ].map((person, i) => (<div key={i} className="text-center space-y-6 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                <img src={resolveImageUrl(person.image)} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{person.name}</h3>
                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{person.role}</p>
              </div>
              <p className="text-slate-500 font-medium italic">{person.desc}</p>
            </div>))}
        </div>
      </section>
    </div>);
};
