// import React, { useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { FaDownload, FaPrint } from "react-icons/fa";
// import { useReactToPrint } from "react-to-print";
// import jsPDF from "jspdf";
// import '../index.css';
// const FinalQuestionPaper = () => {
//   const location = useLocation();
//   const { paper, schoolName, examType, totalDuration, totalMarks, subject } = location.state || {
//     paper: null,
//     schoolName: "Unknown School",
//     examType: "Final Exam",
//     totalDuration: "3 Hours 15 Minutes",
//     totalMarks: 100,
//     subject: "Unknown",
//   };
//   const paperRef = useRef();

//   if (!paper) {
//     return <div className="text-center mt-10 text-gray-700">No question paper found.</div>;
//   }

//   const handleDownloadJSON = () => {
//     const jsonString = JSON.stringify(paper, null, 2);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "question-paper.json";
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   // const handlePrint = useReactToPrint({
//   //   content: () => paperRef.current,
//   // });
//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownloadPDF = () => {
//     const pdf = new jsPDF("p", "mm", "a4");
  
//     // Set default font size
//     pdf.setFontSize(12);
  
//     // Add header
//     pdf.setFont("helvetica", "bold");
//     pdf.text(schoolName, 105, 10, { align: "center" });
//     pdf.setFont("helvetica", "normal");
//     pdf.text(`Exam Type: ${examType}`, 105, 15, { align: "center" });
//     pdf.text(`Subject: ${subject || "Unknown"}`, 105, 20, { align: "center" });
//     pdf.text(`Maximum Marks: ${totalMarks}`, 5, 20, { align: "left" });
//     pdf.text(`Time: ${totalDuration}`, 205, 20, { align: "right" });
  
//     // Add a grey line below the header
//     pdf.setDrawColor(200); // Grey color
//     pdf.setLineWidth(0.5); // Line thickness
//     pdf.line(5, 25, 205, 25); // Draw a line from (x1, y1) to (x2, y2)
  
//     // Add questions
//     let yPos = 32; // Starting Y position for questions
//     const maxWidth = 180; // Maximum width for text (A4 page width - margins)
//     const lineHeight = 5; // Height of each line
//     const bottomMargin = 5; // Bottom margin in mm
  
//     paper.questions.forEach((question, index) => {
//       // Check if the current question will exceed the bottom margin
//       const questionText = `${question.question_number}. ${question.question}`;
//       const questionLines = pdf.splitTextToSize(questionText, maxWidth);
//       const questionHeight = questionLines.length * lineHeight;
  
//       if (yPos + questionHeight > 280 - bottomMargin) {
//         pdf.addPage(); // Add a new page if the content exceeds the page height
//         yPos = 20; // Reset Y position for the new page
//       }
  
//       // Add question number and text
//       pdf.setFont("helvetica", "bold");
//       questionLines.forEach((line) => {
//         pdf.text(line, 15, yPos);
//         yPos += lineHeight;
//       });
  
//       // Handle MCQ options
//       if (question.question_type === "MCQ") {
//         pdf.setFont("helvetica", "normal");
//         question.subparts.forEach((subpart, subIndex) => {
//           const subpartText = `${subpart.subpart_number}) ${subpart.question}`;
//           const subpartLines = pdf.splitTextToSize(subpartText, maxWidth - 5); // Indent subparts
//           const subpartHeight = subpartLines.length * lineHeight;
  
//           if (yPos + subpartHeight > 280 - bottomMargin) {
//             pdf.addPage();
//             yPos = 20;
//           }
  
//           subpartLines.forEach((line) => {
//             pdf.text(line, 20, yPos);
//             yPos += lineHeight;
//           });
  
//           // Add options
//           subpart.options.forEach((option, optIndex) => {
//             const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`;
//             const optionLines = pdf.splitTextToSize(optionText, maxWidth - 10); // Further indent options
//             const optionHeight = optionLines.length * lineHeight;
  
//             if (yPos + optionHeight > 280 - bottomMargin) {
//               pdf.addPage();
//               yPos = 20;
//             }
  
//             optionLines.forEach((line) => {
//               pdf.text(line, 25, yPos);
//               yPos += lineHeight;
//             });
//           });
//         });
//       }
  
//       // Handle Fill in the Blanks with subparts
//       if (question.question_type === "Fill in the Blanks") {
//         pdf.setFont("helvetica", "normal");
//         question.subparts.forEach((subpart, subIndex) => {
//           const subpartText = `${subpart.subpart_number}) ${subpart.question}`;
//           const subpartLines = pdf.splitTextToSize(subpartText, maxWidth - 5); // Indent subparts
//           const subpartHeight = subpartLines.length * lineHeight;
  
//           if (yPos + subpartHeight > 280 - bottomMargin) {
//             pdf.addPage();
//             yPos = 20;
//           }
  
//           subpartLines.forEach((line) => {
//             pdf.text(line, 20, yPos);
//             yPos += lineHeight;
//           });
//         });
//       }
  
//       // Handle Match the Following
//       if (question.question_type === "Match the Following") {
//         pdf.setFont("helvetica", "normal");
//         const matchText = "Match the following terms with their definitions:";
//         const matchHeight = pdf.splitTextToSize(matchText, maxWidth).length * lineHeight;
  
//         if (yPos + matchHeight > 280 - bottomMargin) {
//           pdf.addPage();
//           yPos = 20;
//         }
  
//         pdf.text(matchText, 15, yPos);
//         yPos += lineHeight + 2;
  
//         // Draw table for terms and definitions
//         question.pairs.forEach((pair, pairIndex) => {
//           const termText = `${pair.term}:`;
//           const definitionText = pair.definition;
//           const termLines = pdf.splitTextToSize(termText, maxWidth / 2 - 10);
//           const definitionLines = pdf.splitTextToSize(definitionText, maxWidth / 2 - 10);
//           const pairHeight = Math.max(termLines.length, definitionLines.length) * lineHeight;
  
//           if (yPos + pairHeight > 280 - bottomMargin) {
//             pdf.addPage();
//             yPos = 20;
//           }
  
//           // Draw term
//           termLines.forEach((line) => {
//             pdf.text(line, 20, yPos);
//             yPos += lineHeight - 1;
//           });
  
//           // Draw definition
//           definitionLines.forEach((line) => {
//             pdf.text(line, 110, yPos - lineHeight * termLines.length);
//             yPos += lineHeight - 1;
//           });
//         });
//       }
  
//       // Add marks
//       pdf.setFont("helvetica", "bold");
//       const marksText = `[Marks: ${question.marks}]`;
//       const marksHeight = pdf.splitTextToSize(marksText, maxWidth).length * lineHeight;
  
//       if (yPos + marksHeight > 280 - bottomMargin) {
//         pdf.addPage();
//         yPos = 20;
//       }
  
//       pdf.text(marksText, 180, yPos, { align: "right" });
  
//       yPos += 8; // Add space between questions
//     });
  
//     // Save the PDF
//     pdf.save("question-paper.pdf");
//   };

//   return (
//     <div className="min-h-screen bg-white py-10 px-5 md:px-20">
//       <div className="no-print flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Final Question Paper</h1>
//         <div className="flex space-x-3">
//           <button onClick={handleDownloadJSON} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center">
//             <FaDownload className="mr-2" /> Download JSON
//           </button>
//           <button onClick={handleDownloadPDF} className="bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center">
//             <FaDownload className="mr-2" /> Download PDF
//           </button>
//           <button onClick={handlePrint} className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center">
//             <FaPrint className="mr-2" /> Print
//           </button>
//         </div>
//       </div>

//       <div ref={paperRef} className="border p-5 rounded-lg shadow-lg bg-white">
//         {/* HEADER */}
//         <div className="text-center border-b pb-4 mb-4">
//           <h2 className="text-2xl font-bold">{schoolName}</h2>
//           <p className="text-lg font-semibold">Exam Type: {examType}</p>
//           <p className="text-lg">Subject: {subject || "Unknown"}</p>
//           <p className="text-lg">Maximum Marks: {totalMarks}</p>
//           <p className="text-lg">Time: {totalDuration}</p>
//         </div>

//         {/* QUESTIONS */}
//         {paper.questions.map((question, index) => (
//           <div key={index} className="border-b pb-4 mb-4">
//             <h3 className="text-lg font-semibold">
//               {question.question_number}. {question.question}
//             </h3>

//             {/* MCQ Options */}
//             {question.question_type === "MCQ" && (
//               <ul className="ml-5 list-disc">
//                 {question.subparts.map((subpart, subIndex) => (
//                   <li key={subIndex} className="text-gray-800">
//                     {subpart.subpart_number}) {subpart.question}
//                     <ul className="ml-5 list-disc">
//                       {subpart.options.map((option, optIndex) => (
//                         <li key={optIndex} className="text-gray-800">
//                           {String.fromCharCode(65 + optIndex)}. {option}
//                         </li>
//                       ))}
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {/* Fill in the Blanks Subparts */}
//             {question.question_type === "Fill in the Blanks" && (
//               <ul className="ml-5 list-disc">
//                 {question.subparts.map((subpart, subIndex) => (
//                   <li key={subIndex} className="text-gray-800">
//                     {subpart.subpart_number}) {subpart.question} 
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {/* Match the Following Pairs */}
//             {question.question_type === "Match the Following" && (
//               <table className="w-full border-collapse mt-4">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="border p-2 text-left">Term</th>
//                     <th className="border p-2 text-left">Definition</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {question.pairs.map((pair, pairIndex) => (
//                     <tr key={pairIndex} className="border">
//                       <td className="border p-2 text-gray-800">{pair.term}</td>
//                       <td className="border p-2 text-gray-800">{pair.definition}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {/* Marks */}
//             <p className="text-right text-gray-700">[Marks: {question.marks}]</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FinalQuestionPaper;
import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaDownload, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";

const FinalQuestionPaper = () => {
  const location = useLocation();
  const { paper, schoolName, examType, totalDuration, totalMarks, subject, class: className} = location.state || {
    paper: null,
    schoolName: "Unknown School",
    examType: "Final Exam",
    totalDuration: "3 Hours",
    totalMarks: 100,
    subject: "Unknown",
    className: "10", // Add class information
  };
  const paperRef = useRef();

  if (!paper) {
    return <div className="text-center mt-10 text-gray-700">No question paper found.</div>;
  }

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(paper, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "question-paper.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Set default font size
    pdf.setFontSize(12);

    // Add header
    pdf.setFont("helvetica", "bold");
    pdf.text(schoolName, 105, 10, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.text(`Exam Type: ${examType}`, 105, 15, { align: "center" });
    pdf.text(`Subject: ${subject || "Unknown"}`, 105, 20, { align: "center" });
    pdf.text(`Maximum Marks: ${totalMarks}`, 5, 20, { align: "left" });
    pdf.text(`Time: ${totalDuration}`, 205, 20, { align: "right" });

    // Add a grey line below the header
    pdf.setDrawColor(200); // Grey color
    pdf.setLineWidth(0.5); // Line thickness
    pdf.line(5, 25, 205, 25); // Draw a line from (x1, y1) to (x2, y2)

    // Add questions
    let yPos = 32; // Starting Y position for questions
    const maxWidth = 180; // Maximum width for text (A4 page width - margins)
    const lineHeight = 5; // Height of each line
    const bottomMargin = 5; // Bottom margin in mm

    paper.questions.forEach((question, index) => {
      // Check if the current question will exceed the bottom margin
      const questionText = `${question.question_number}. ${question.question}`;
      const questionLines = pdf.splitTextToSize(questionText, maxWidth);
      const questionHeight = questionLines.length * lineHeight;

      if (yPos + questionHeight > 280 - bottomMargin) {
        pdf.addPage(); // Add a new page if the content exceeds the page height
        yPos = 20; // Reset Y position for the new page
      }

      // Add question number and text
      pdf.setFont("helvetica", "bold");
      questionLines.forEach((line) => {
        pdf.text(line, 15, yPos);
        yPos += lineHeight;
      });

      // Handle MCQ options
      if (question.question_type === "MCQ"&& question.subparts) {
        pdf.setFont("helvetica", "normal");
        question.subparts.forEach((subpart, subIndex) => {
          const subpartText = `${subpart.subpart_number}) ${subpart.question}`;
          const subpartLines = pdf.splitTextToSize(subpartText, maxWidth - 5); // Indent subparts
          const subpartHeight = subpartLines.length * lineHeight;

          if (yPos + subpartHeight > 280 - bottomMargin) {
            pdf.addPage();
            yPos = 20;
          }

          subpartLines.forEach((line) => {
            pdf.text(line, 20, yPos);
            yPos += lineHeight;
          });

          // Add options
          subpart.options.forEach((option, optIndex) => {
            const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`;
            const optionLines = pdf.splitTextToSize(optionText, maxWidth - 10); // Further indent options
            const optionHeight = optionLines.length * lineHeight;

            if (yPos + optionHeight > 280 - bottomMargin) {
              pdf.addPage();
              yPos = 20;
            }

            optionLines.forEach((line) => {
              pdf.text(line, 25, yPos);
              yPos += lineHeight;
            });
          });
        });
      }

      // Handle Fill in the Blanks with subparts
      if (question.question_type === "Fill in the Blanks"&& question.subparts) {
        pdf.setFont("helvetica", "normal");
        question.subparts.forEach((subpart, subIndex) => {
          const subpartText = `${subpart.subpart_number}) ${subpart.question}`;
          const subpartLines = pdf.splitTextToSize(subpartText, maxWidth - 5); // Indent subparts
          const subpartHeight = subpartLines.length * lineHeight;

          if (yPos + subpartHeight > 280 - bottomMargin) {
            pdf.addPage();
            yPos = 20;
          }

          subpartLines.forEach((line) => {
            pdf.text(line, 20, yPos);
            yPos += lineHeight;
          });
        });
      }

      // Handle Match the Following
      if (question.question_type === "Match the Following" && question.pairs) {
        pdf.setFont("helvetica", "normal");
        const matchText = "Match the following terms with their definitions:";
        const matchHeight = pdf.splitTextToSize(matchText, maxWidth).length * lineHeight;

        if (yPos + matchHeight > 280 - bottomMargin) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.text(matchText, 15, yPos);
        yPos += lineHeight + 2;

        // Draw table for terms and definitions
        question.pairs.forEach((pair, pairIndex) => {
          const termText = `${pair.term}:`;
          const definitionText = pair.definition;
          const termLines = pdf.splitTextToSize(termText, maxWidth / 2 - 10);
          const definitionLines = pdf.splitTextToSize(definitionText, maxWidth / 2 - 10);
          const pairHeight = Math.max(termLines.length, definitionLines.length) * lineHeight;

          if (yPos + pairHeight > 280 - bottomMargin) {
            pdf.addPage();
            yPos = 20;
          }

          // Draw term
          termLines.forEach((line) => {
            pdf.text(line, 20, yPos);
            yPos += lineHeight - 1;
          });

          // Draw definition
          definitionLines.forEach((line) => {
            pdf.text(line, 110, yPos - lineHeight * termLines.length);
            yPos += lineHeight - 1;
          });
        });
      }

      // Add marks
      pdf.setFont("helvetica", "bold");
      const marksText = `[Marks: ${question.marks}]`;
      const marksHeight = pdf.splitTextToSize(marksText, maxWidth).length * lineHeight;

      if (yPos + marksHeight > 280 - bottomMargin) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.text(marksText, 180, yPos, { align: "right" });

      yPos += 8; // Add space between questions
    });

    // Save the PDF
    pdf.save("question-paper.pdf");
  };

  return (
    <div className="on-print1 min-h-screen bg-white py-10 px-5 md:px-20">
      <div className="no-print flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Final Question Paper</h1>
        <div className="flex space-x-3">
          <button onClick={handleDownloadJSON} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center">
            <FaDownload className="mr-2" /> Download JSON
          </button>
          <button onClick={handleDownloadPDF} className="bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center">
            <FaDownload className="mr-2" /> Download PDF
          </button>
          <button onClick={handlePrint} className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center">
            <FaPrint className="mr-2" /> Print
          </button>
        </div>
      </div>

      <div ref={paperRef} className="border on-print p-5 rounded-lg shadow-lg bg-white">
        {/* HEADER */}
        <div className="text-center border-b border-black pb-2 mb-2">
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-left">
              <p className="text-lg">Maximum Marks: {totalMarks}</p>
              <p className="text-lg">Subject: {subject || "Unknown"}</p>
            </div>
            <div className="text-center">
             <h2 className="text-2xl font-bold">{schoolName}</h2>
              <p className="text-lg font-semibold">{examType}</p>
            </div>
            <div className="text-right">
              <p className="text-lg">Time: {totalDuration}</p>
              <p className="text-lg">Class: {className}</p>
            </div>
          </div>
        </div>

        {/* EXAM INSTRUCTIONS */}
        <div className="border border-black rounded-xl p-2 mb-4">
          <h3 className="text-lg font-semibold">Instructions:</h3>
          <ul className="list-disc ml-5">
            <li>Answer all questions.</li>
            <li>Write your answers in the provided space.</li>
            <li>Use a black or blue pen.</li>
            <li>Calculators are not allowed.</li>
            <li>Ensure your answers are clear and legible.</li>
          </ul>
        </div>

        {/* QUESTIONS */}
        {paper.questions.map((question, index) => (
          <div key={index} className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold">
              {question.question_number}. {question.question}
            </h3>

            {/* MCQ Options */}
            {question.question_type === "MCQ" && question.subparts && (
              <ul className="ml-5 list-disc">
                {question.subparts.map((subpart, subIndex) => (
                  <li key={subIndex} className="text-gray-800">
                    {subpart.subpart_number}) {subpart.question}
                    <ul className="ml-5 list-disc">
                      {subpart.options.map((option, optIndex) => (
                        <li key={optIndex} className="text-gray-800">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {/* Fill in the Blanks Subparts */}
            {question.question_type === "Fill in the Blanks" && question.subparts && (
              <ul className="ml-5 list-disc">
                {question.subparts.map((subpart, subIndex) => (
                  <li key={subIndex} className="text-gray-800">
                    {subpart.subpart_number}) {subpart.question}
                  </li>
                ))}
              </ul>
            )}

            {/* Match the Following Pairs */}
            {question.question_type === "Match the Following" && (
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-left">Term</th>
                    <th className="border p-2 text-left">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {question.pairs.map((pair, pairIndex) => (
                    <tr key={pairIndex} className="border">
                      <td className="border p-2 text-gray-800">{pair.term}</td>
                      <td className="border p-2 text-gray-800">{pair.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Marks */}
            <p className="text-right text-gray-700">[Marks: {question.marks}]</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinalQuestionPaper;