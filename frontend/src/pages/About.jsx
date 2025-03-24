import React from "react";

const About = () => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">About Us</h2>
      <p className="text-gray-600 text-lg leading-relaxed">
        Welcome to our platform! We are dedicated to providing top-notch healthcare services by 
        connecting patients with the best doctors effortlessly. Our mission is to make healthcare 
        accessible and convenient for everyone.
      </p>

      <h3 className="text-2xl font-semibold mt-6">Our Vision</h3>
      <p className="text-gray-600 text-lg leading-relaxed">
        To revolutionize the way people access healthcare by leveraging technology and 
        simplifying the booking process for patients.
      </p>

      <h3 className="text-2xl font-semibold mt-6">Our Team</h3>
      <p className="text-gray-600 text-lg leading-relaxed">
        Our team consists of experienced healthcare professionals, developers, and customer 
        support specialists working together to bring you the best service.
      </p>
    </div>
  );
};

export default About;
