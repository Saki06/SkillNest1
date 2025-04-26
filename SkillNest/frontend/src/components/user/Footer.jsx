import React from 'react';
import { Facebook, Rss, Twitter, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <div className="mt-6 py-4 text-center text-gray-600 text-sm">
      <div className="mb-2">
        <a href="/terms" className="hover:text-blue-600">Terms of Service</a>
        <span className="mx-2">|</span>
        <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
      </div>
      <div className="flex justify-center gap-4 mb-3">
        <a href="#" className="text-gray-600 hover:text-blue-600">
          <Facebook size={20} />
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          <Rss size={20} />
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          <Twitter size={20} />
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          <Youtube size={20} />
        </a>
        <a href="#" className="text-gray-600 hover:text-blue-600">
          <Instagram size={20} />
        </a>
      </div>
      <div>
        <p>CourseNetworking, LLC</p>
        <p>© 2011-2025</p>
        <p className="text-xs mt-1">Latest version V6 Apr 10, 2025</p>
      </div>
    </div>
  );
};

export default Footer;
