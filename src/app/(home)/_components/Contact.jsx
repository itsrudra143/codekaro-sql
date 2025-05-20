"use client";
import React from "react";

const GetInTouch = () => {
  const teamMembers = [
    {
      name: "Rudrakshi",
      roll: "2210990747",
      group: "G12",
      github: "https://github.com/itsrudra143",
      linkedin: "https://www.linkedin.com/in/rudrakshi-sharma/",
      email: "rudrakshi747.be22@chitkara.edu.in",
    },
    {
      name: "Sakshi Rana",
      roll: "2210990769",
      group: "G12",
      github: "https://github.com/Sakshirana18",
      linkedin: "http://www.linkedin.com/in/sakshi-rana-259362275",
      email: "sakshi769.be22@chitkara.edu.in",
    },
    {
      name: "Samar Saini",
      roll: "2210990772",
      group: "G12",
      github: "https://github.com/itssamar0401",
      linkedin: "#",
      email: "samar772.be22@chitkara.edu.in",
    },
  ];

  return (
    <section className="py-10 text-white text-center px-6">
      <h2 className="text-4xl font-bold text-white mb-6">Get in Touch</h2>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12">
        Connect with the people behind Code Karo—dedicated, innovative, and
        ready to help you on your coding journey.
      </p>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="relative group flex flex-col items-center gap-4 px-6 py-8 rounded-lg text-gray-300 bg-gray-800/50 
              hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg overflow-hidden cursor-pointer"
            onClick={() => window.open(member.github, "_blank")}>
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 
              to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div className="flex flex-col items-center gap-2">
              <h3 className="text-2xl font-semibold text-white">
                {member.name}
              </h3>
              <p className="text-gray-300">{member.roll}</p>
              <p className="text-gray-300">{member.group}</p>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}>
                💻 GitHub
              </a>
              {member.linkedin !== "#" && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}>
                  🔗 LinkedIn
                </a>
              )}
              <a
                href={`mailto:${member.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}>
                📧 Email
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GetInTouch;
