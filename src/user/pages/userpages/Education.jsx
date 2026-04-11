import React from 'react'
import { motion } from 'framer-motion'
import EducationSection from '../../../user/components/EducationSection'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'

export default function Education() {
  const { sortedEducation } = usePortfolioData()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Education Journey of Atif Ayyoub',
    description:
      'Software engineering education and academic background showing computer science learning progression and front-end developer education history in Pakistan.',
    itemListElement: sortedEducation.map((item, index) => ({
      '@type': 'EducationalOccupationalCredential',
      position: index + 1,
      name: item.title,
      description: item.description,
      recognizedBy: {
        '@type': 'CollegeOrUniversity',
        name: item.institution,
      },
    })),
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Seo
        title="Education | Atif Ayyoub"
        description="Software engineering education and academic background of Atif Ayyoub, including computer science learning milestones and front-end developer education history in Pakistan."
        pathname="/education"
        schema={schema}
      />
      <EducationSection items={sortedEducation} />
    </motion.section>
  )
}




