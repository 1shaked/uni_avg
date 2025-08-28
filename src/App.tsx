import { useForm, useFieldArray } from 'react-hook-form';

import './App.css'
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';


export type STATUS_ACTIONS = 'ADD' | 'REMOVE' | 'UPDATE';

export type Grades =
  | {
      status: 'ADD';
      grade: number;
      points: number;
      label?: string; // Optional label for the grade
    }
  | {
      status: 'REMOVE';
      grade: number;
      points: number;
      label?: string; // Optional label for the grade
    }
  | {
      status: 'UPDATE';
      previous: number;
      new: number;
      points: number;
      label?: string; // Optional label for the grade
    };

export interface GradesBaseI {
  points: number;
  grade: number;
}

export interface FormI {
  points: number;
  avg_grade: number;
  grades: Grades[];
}

function calculateAverage(form: FormI): number {
  const grades = form.grades;
  form.points = typeof form.points === 'string' ? parseFloat(form.points) : form.points;
  form.avg_grade = typeof form.avg_grade === 'string' ? parseFloat(form.avg_grade) : form.avg_grade;
  const total_points = grades.reduce((acc, grade) => {
    grade.points = typeof grade.points === 'string' ? parseFloat(grade.points) : grade.points;
    if (grade.status === 'ADD') {
      return acc + grade.points;
    } else if (grade.status === 'REMOVE') {
      return acc - grade.points;
    }
    return acc;
  }, 0);
  let total_grades_points = form.avg_grade * form.points;
  for (const grade of grades) {
    if (grade.status === 'ADD') {
      total_grades_points += grade.grade * grade.points;
    } else if (grade.status === 'REMOVE') {
      total_grades_points -= grade.grade * grade.points;
    }
    // For 'UPDATE', we consider the points as adding and then removing the previous points
    else {
      total_grades_points += (grade.new - grade.previous) * grade.points;
    }
  }
  return total_grades_points / (total_points + form.points);
}

function App() {
  

  const [avg, setAvg] = useState(0);
  const form = useForm<FormI>({
    defaultValues: {
      points: 0,
      avg_grade: 0,
      grades: [],
    },
  });
  const grades = useFieldArray({
    control: form.control,
    name: 'grades',
  })

  const avg_grade = form.watch('avg_grade');
  const points = form.watch('points');
  return (
    <>
      <div>
        <h1>Calculate the avg grade {avg.toFixed(2)}</h1>
      </div>
      <div>
        <h1>
          <a href="https://www.youtube.com/@pilearn1266" className='text-red-500' target="_blank" rel="noopener noreferrer">My youtube channel (Click)</a>
        </h1>
      </div>
      <div>
        <p className="text-lg font-medium">Total Points: {points}</p>
        <p className="text-lg font-medium">Average: {avg_grade}</p>
      </div>

      <br />
      {/* create a form to insert the grades  */}
      <form onSubmit={form.handleSubmit(data => {
        console.log(data);
        const newAvg = calculateAverage(data);
        setAvg(newAvg);
      })} style={{ marginTop: '1em' }}>

          {/* Prominent design for total points and average grade fields, supporting dark mode */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-col flex-1">
              <label htmlFor="points" className="mb-1 font-semibold text-gray-700 dark:text-gray-200">Total Points</label>
              <input
                id="points"
                type="text"
                {...form.register('points')}
                className="border-2 border-blue-400 dark:border-blue-500 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter total points"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="avg_grade" className="mb-1 font-semibold text-gray-700 dark:text-gray-200">Average Grade</label>
              <input
                id="avg_grade"
                type="text"
                {...form.register('avg_grade')}
                className="border-2 border-green-400 dark:border-green-500 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-green-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter average grade"
              />
            </div>
          </div>

          <br />
          {/* create a form to insert the grades  */}
          {grades.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-3 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className='flex flex-col align-middle'>
                <div className='mb-1'>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Label</label>
                </div>
                <input type="text" {...form.register(`grades.${index}.label`)} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Label" />
              </div>
              <div className='flex flex-col align-middle'>
                <div className='mb-1'>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                </div>
                <select
                  {...form.register(`grades.${index}.status`)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="ADD">Add</option>
                  <option value="REMOVE">Remove</option>
                  <option value="UPDATE">Update</option>
                </select>
              </div>
              {field.status === 'ADD' || field.status === 'REMOVE' ? (
                <>
                  <div className="flex flex-col align-middle">
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Grade</label>
                    </div>
                    <input
                      type="number"
                      placeholder="Grade"
                      {...form.register(`grades.${index}.grade`)}
                      className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Points</label>
                    </div>
                      <input
                      type="text"
                      placeholder="Points"
                      {...form.register(`grades.${index}.points`)}
                      className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Previous"
                    {...form.register(`grades.${index}.previous`)}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="New"
                    {...form.register(`grades.${index}.new`)}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="Points"
                    {...form.register(`grades.${index}.points`)}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => grades.remove(index)}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          <div>
            {/* add grade button */}
            <button type="button" onClick={() => grades.append({ status: 'ADD', grade: 0, points: 0 })}>
              Add Grade
            </button>
          </div>

          <br />

        <button type="submit">Submit grades</button>

      </form>
        <CourseReview />
    </>
  )
}



import { useEffect } from "react";

// grabs every .md file in src/content at build time as raw text

export function CourseReview() {
  const [docs, setDocs] = useState<{ name: string; text: string }[]>([]);

  useEffect(() => {
    async function loadAll() {
      const results = [];
      for (const name of MD_Files) {
        const res = await fetch(`/${name}`);  // files in public/ served from root
        const text = await res.text();
        results.push({ name, text });
      }
      setDocs(results);
    }
    loadAll();
  }, []);

  return (
    <div className="p-6 space-y-10">
      {docs.map(doc => (
        <section key={doc?.name} className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-2">{doc.name}</h2>
          <article className="prose max-w-none">
            <ReactMarkdown>{doc.text}</ReactMarkdown>
          </article>
        </section>
      ))}
    </div>
  );
}


export const MD_Files = [
  "algo2.md",
  "bi.md",
  "data_r.md",
  "ecom_elcronics.md",
  "nlp.md",
  "process_mining.md",
  "robotics.md"
];

export default App
