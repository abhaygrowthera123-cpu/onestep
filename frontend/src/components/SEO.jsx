import React from 'react';
import { Helmet } from 'react-helmet-async';
export const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = "Onestep-Hub";
    const fullTitle = `${title} | ${siteTitle}`;
    const defaultImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070";
    const siteUrl = window.location.origin;
    return (<Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description}/>
      {keywords && <meta name="keywords" content={keywords}/>}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website"/>
      <meta property="og:url" content={url || siteUrl}/>
      <meta property="og:title" content={fullTitle}/>
      <meta property="og:description" content={description}/>
      <meta property="og:image" content={image || defaultImage}/>

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image"/>
      <meta property="twitter:url" content={url || siteUrl}/>
      <meta property="twitter:title" content={fullTitle}/>
      <meta property="twitter:description" content={description}/>
      <meta property="twitter:image" content={image || defaultImage}/>
    </Helmet>);
};
