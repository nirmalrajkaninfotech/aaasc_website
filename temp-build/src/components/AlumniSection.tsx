import Image from 'next/image';
import { AlumniAssociation } from '@/types';

export default function AlumniSection({ alumni }: { alumni: AlumniAssociation }) {
  if (!alumni) return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-yellow-500 text-5xl mb-4">ℹ️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Alumni Data Available</h2>
      <p className="text-gray-600">Please check back later for updates.</p>
    </div>
  );

  return (
    <section 
      aria-labelledby="alumni-heading" 
      className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden mb-12"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 id="alumni-heading" className="text-2xl font-bold text-white">
              {alumni.title}
            </h2>
            <p className="text-blue-100 text-lg">
              Our distinguished alumni network
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-8">
        {alumni.image && (
          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
            <Image 
              src={alumni.image} 
              alt={alumni.title} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        )}

        <div className="mb-8">
          <div 
            className="text-gray-700 space-y-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_a]:text-blue-600 [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: alumni.content }}
          />
        </div>

        {alumni.members && alumni.members.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Notable Alumni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.members.map((member, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  {member.image && (
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        fill 
                        className="rounded-full object-cover border-4 border-blue-100"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-center text-gray-900">{member.name}</h4>
                  <div className="text-blue-600 text-sm font-medium text-center mb-2">{member.year}</div>
                  {member.description && (
                    <p className="text-gray-600 text-sm text-center">{member.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
