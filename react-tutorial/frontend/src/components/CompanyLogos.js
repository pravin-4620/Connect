// Company Logos Component
// This component provides company logo URLs and fallback styling

const CompanyLogos = {
  // Tech Giants
  'Google India': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    bg: 'bg-white',
    fallback: 'G'
  },
  'Microsoft': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    bg: 'bg-white',
    fallback: 'M'
  },
  'Amazon': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    bg: 'bg-white',
    fallback: 'A'
  },
  'Apple': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    bg: 'bg-white',
    fallback: 'A'
  },
  'Meta': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    bg: 'bg-white',
    fallback: 'M'
  },
  'Netflix': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    bg: 'bg-black',
    fallback: 'N'
  },
  
  // Indian IT Services
  'TCS': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Tata_Consultancy_Services_Logo.svg',
    bg: 'bg-white',
    fallback: 'TCS'
  },
  'Infosys': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    bg: 'bg-white',
    fallback: 'I'
  },
  'Wipro': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
    bg: 'bg-white',
    fallback: 'W'
  },
  'HCL Technologies': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/HCL_Technologies_logo.svg',
    bg: 'bg-white',
    fallback: 'HCL'
  },
  'Tech Mahindra': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Tech_Mahindra_New_Logo.svg',
    bg: 'bg-white',
    fallback: 'TM'
  },
  
  // Consulting & Services
  'Accenture': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
    bg: 'bg-white',
    fallback: 'A'
  },
  'Deloitte': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg',
    bg: 'bg-white',
    fallback: 'D'
  },
  'Capgemini': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Capgemini_201x_logo.svg',
    bg: 'bg-white',
    fallback: 'C'
  },
  
  // Finance & Banking
  'Goldman Sachs': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    bg: 'bg-white',
    fallback: 'GS'
  },
  'Morgan Stanley': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Morgan_Stanley_Logo_1.svg',
    bg: 'bg-white',
    fallback: 'MS'
  },
  'JPMorgan Chase': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/JPMorgan_Chase_Logo_2008_1.svg',
    bg: 'bg-white',
    fallback: 'JP'
  },
  
  // E-commerce & Retail
  'Flipkart': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Flipkart_logo.svg',
    bg: 'bg-white',
    fallback: 'F'
  },
  'Walmart': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
    bg: 'bg-white',
    fallback: 'W'
  },
  
  // Telecom
  'Jio': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Reliance_Jio_Logo.svg',
    bg: 'bg-white',
    fallback: 'J'
  },
  'Airtel': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Airtel_logo.svg',
    bg: 'bg-white',
    fallback: 'A'
  },
  
  // Software & Cloud
  'Adobe': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg',
    bg: 'bg-white',
    fallback: 'A'
  },
  'Oracle': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    bg: 'bg-white',
    fallback: 'O'
  },
  'Salesforce': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    bg: 'bg-white',
    fallback: 'SF'
  },
  'SAP': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg',
    bg: 'bg-white',
    fallback: 'SAP'
  },
  
  // Automotive
  'Tesla': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
    bg: 'bg-white',
    fallback: 'T'
  },
  'Uber': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg',
    bg: 'bg-white',
    fallback: 'U'
  },
  
  // Social Media & Communication
  'LinkedIn': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    bg: 'bg-white',
    fallback: 'in'
  },
  'Twitter': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    bg: 'bg-white',
    fallback: 'T'
  },
  'Slack': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg',
    bg: 'bg-white',
    fallback: 'S'
  },
  
  // Gaming & Entertainment
  'Sony': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    bg: 'bg-white',
    fallback: 'S'
  },
  'Electronic Arts': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Electronic-Arts-Logo.svg',
    bg: 'bg-white',
    fallback: 'EA'
  },
  
  // Semiconductors & Hardware
  'Intel': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
    bg: 'bg-white',
    fallback: 'I'
  },
  'Qualcomm': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Qualcomm-Logo.svg',
    bg: 'bg-white',
    fallback: 'Q'
  },
  'NVIDIA': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
    bg: 'bg-white',
    fallback: 'N'
  },
  
  // Startups & Unicorns (India)
  'Zomato': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
    bg: 'bg-white',
    fallback: 'Z'
  },
  'Swiggy': {
    url: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
    bg: 'bg-white',
    fallback: 'S'
  },
  'Paytm': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg',
    bg: 'bg-white',
    fallback: 'P'
  },
  'PhonePe': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/PhonePe_Logo.svg',
    bg: 'bg-white',
    fallback: 'PP'
  },
  'OLA': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Ola_Cabs_logo.png',
    bg: 'bg-white',
    fallback: 'O'
  }
};

// Helper component to display company logo with fallback
export const CompanyLogo = ({ companyName, size = 'md', className = '' }) => {
  const company = CompanyLogos[companyName];
  
  const sizeClasses = {
    'sm': 'w-8 h-8 text-xs',
    'md': 'w-12 h-12 text-sm',
    'lg': 'w-16 h-16 text-base',
    'xl': 'w-20 h-20 text-lg'
  };

  if (!company) {
    // Fallback for unknown companies
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600`}>
        {companyName.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} ${company.bg} rounded-lg flex items-center justify-center p-2 border border-gray-200 overflow-hidden`}>
      <img 
        src={company.url} 
        alt={`${companyName} logo`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // If image fails to load, show fallback text
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden items-center justify-center font-bold text-gray-700 text-sm w-full h-full">
        {company.fallback}
      </div>
    </div>
  );
};

export default CompanyLogos;
