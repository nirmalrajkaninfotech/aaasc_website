import React from 'react';
import Layout from '../components/Layout';
import HeroBanner from '../components/HeroBanner';
import Card from '../components/Card';

export default function Home() {
  return (
    <Layout>
      <HeroBanner 
        title="Welcome to AAASC"
        subtitle="Arulmigu Arthanareeswarar Arts and Science College"
        ctaText="Explore Courses"
        ctaLink="/courses"
      />
      
      <section className="about-section">
        <Card 
          title="About Our College"
          description="Our college provides quality education with ethical values..."
        />
      </section>
    </Layout>
  );
}
