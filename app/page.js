"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wind, Thermometer, Search, CalendarDays, Lightbulb } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Home = () => {
  const [startYear, setStartYear] = useState('2000');
  const [endYear, setEndYear] = useState('2023');
  const [dataType, setDataType] = useState('Temperature');
  const [city, setCity] = useState('');
  const [showData, setShowData] = useState(false);
  const [aiMessage, setAiMessage] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const genAI = new GoogleGenerativeAI('AIzaSyDaaef5eoNhHQxEgRW46_xy3X02REdF5zw');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

  const generateDummyData = (start, end, type, selectedCity) => {
    const data = [];
    let lastValue = type === 'Temperature' ? 20 : 10;
    
    for (let year = parseInt(start); year <= parseInt(end); year++) {
      const randomChange = (Math.random() - 0.5) * 2;
      lastValue += randomChange;
      
      if (type === 'Temperature') {
        lastValue = Math.max(15, Math.min(25, lastValue));
      } else {
        lastValue = Math.max(5, Math.min(20, lastValue));
      }
      
      data.push({
        year: year.toString(),
        value: parseFloat(lastValue.toFixed(1))
      });
    }
    return data;
  };

  const generateAIResponse = async (data) => {
    try {
      setIsLoadingAI(true);
      const averageValue = (data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(2);
      const trend = data[data.length - 1].value > data[0].value ? "increasing" : "decreasing";
      
      const prompt = `
        Analyze this climate data for ${city}:
        - Data type: ${dataType}
        - Time period: ${startYear} to ${endYear}
        - Average ${dataType.toLowerCase()}: ${averageValue} ${dataType === 'Temperature' ? '°C' : 'km/h'}
        - Overall trend: ${trend}

        Provide 3 specific insights about:
        1. The environmental impact
        2. Recommendations for local authorities
        3. Future predictions based on this trend

        Format the response as a JSON array with three objects, each having 'title' and 'description' properties.
        Keep each description concise but specific to ${city}.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response.text().replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1');
      const text= "[" + response.replace(/```json\s*/i, '').replace(/\s*```$/, '').trim().replace('```','')+ "]"

      const parsedResponse = JSON.parse(text);
      setAiMessage(parsedResponse);
    } catch (error) {
      console.error('AI generation error:', error);
      setAiMessage([{
        title: "Analysis Unavailable",
        description: "We couldn't generate AI insights at the moment. Please try again later."
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowData(true);
    const data = generateDummyData(startYear, endYear, dataType, city);
    await generateAIResponse(data);
  };

  const dummyData = generateDummyData(startYear, endYear, dataType, city);


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-600">Year: {label}</p>
          <p className="text-sm text-blue-600">
            {dataType}: {payload[0].value} {dataType === 'Temperature' ? '°C' : 'km/h'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Climate Data Visualization</h1>
            <p className="text-gray-600">Analyze historical climate patterns for cities worldwide</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                Start Year
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                min="1900"
                max="2024"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                End Year
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                min="1900"
                max="2024"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {dataType === 'Temperature' ? (
                  <Thermometer className="w-4 h-4 mr-2" />
                ) : (
                  <Wind className="w-4 h-4 mr-2" />
                )}
                Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none appearance-none bg-white"
                required
              >
                <option value="Temperature">Temperature</option>
                <option value="Wind">Wind</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Search className="w-4 h-4 mr-2" />
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="Enter city name"
                required
              />
            </div>

            <div className="lg:col-span-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                <span>Generate Visualization</span>
              </button>
            </div>
          </form>

          {showData && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dummyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="year" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        label={{ 
                          value: dataType === 'Temperature' ? 'Temperature (°C)' : 'Wind Speed (km/h)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: '#6b7280' }
                        }}
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name={dataType} 
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                        activeDot={{ stroke: '#2563eb', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

             <div className="relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Lightbulb className="w-6 h-6 mr-2 text-blue-600" />
                  AI-Generated Insights
                </h2>
                
                {isLoadingAI ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-20 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiMessage.map((insight, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{insight.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home;