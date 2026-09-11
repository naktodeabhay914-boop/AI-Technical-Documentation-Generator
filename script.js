
// =====================================================
// AI TECHNICAL DOCUMENTATION GENERATOR
// =====================================================

// ⚠️ PUT YOUR NEW GEMINI API KEY HERE

const API_KEY = "YOUR_NEW_API_KEY_HERE";


// Global documentation storage
let generatedDocumentation = "";


// =====================================================
// GENERATE DOCUMENTATION
// =====================================================

async function generateDocumentation() {

    const projectName =
        document.getElementById("projectName").value.trim();

    const techStack =
        document.getElementById("techStack").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const sourceCode =
        document.getElementById("sourceCode").value.trim();

    const output =
        document.getElementById("output");

    const statusBox =
        document.getElementById("statusBox");

    const statusTitle =
        document.getElementById("statusTitle");

    const statusText =
        document.getElementById("statusText");


    // Validation
    if (!projectName) {

        output.innerHTML =
            "⚠️ Please enter the project name.";

        return;
    }

    if (!description) {

        output.innerHTML =
            "⚠️ Please enter the project description.";

        return;
    }

    if (!sourceCode) {

        output.innerHTML =
            "⚠️ Please paste your source code or README.";

        return;
    }


    // Show loading
    statusBox.classList.remove("hidden");

    statusTitle.innerText =
        "AI is analyzing your project...";

    statusText.innerText =
        "Reading source code and project information";

    output.innerHTML = `
        <div class="empty-state">
            <div class="spinner"></div>
            <h3 style="margin-top:20px;">
                Analyzing your project...
            </h3>
            <p>
                Detecting architecture, modules,
                database and technical components.
            </p>
        </div>
    `;


    // Prompt
    const prompt = `

You are an expert Software Architect,
Senior Developer and Technical Documentation Engineer.

Your task is to analyze the provided software project
and generate accurate professional technical documentation.

==================================================
PROJECT INFORMATION
==================================================

PROJECT NAME:
${projectName}

TECHNOLOGY STACK:
${techStack}

PROJECT DESCRIPTION:
${description}

==================================================
SOURCE CODE / README
==================================================

${sourceCode}

==================================================
DOCUMENTATION REQUIREMENTS
==================================================

Generate the following sections:

# ${projectName}

## 1. Project Overview

Explain the purpose and functionality of the project.

## 2. Problem Statement

Explain the problem this project solves.

## 3. Objectives

List the main objectives.

## 4. Key Features

List all features that can actually be verified
from the supplied project.

## 5. Technology Stack

Create a table containing:
Technology | Purpose

## 6. System Requirements

Mention required software and hardware
only when supported by the source.

## 7. System Architecture

Explain the architecture.

Also provide a simple text architecture diagram.

Example:

User
 ↓
Application
 ↓
Business Logic
 ↓
Database

## 8. Project Structure

Explain the important files and folders.

## 9. Module Description

For every important class, function or module explain:

- Name
- Purpose
- Inputs
- Outputs
- Responsibilities
- Dependencies

## 10. Data Flow

Explain how data moves through the system.

## 11. Database Design

If a database exists:

- Database name
- Tables
- Columns
- Data types
- Primary keys
- Relationships

If no database exists write:
"Not specified."

## 12. API Documentation

Document actual APIs or endpoints
only if they exist.

If there are no APIs write:
"No external API is exposed."

## 13. Installation Guide

Provide step-by-step installation instructions.

## 14. Configuration

Explain configuration requirements.

## 15. Usage Guide

Explain how a user operates the system.

## 16. Error Handling

Explain error and exception handling.

## 17. Testing

Create useful test cases based on actual functionality.

Format:

| Test Case | Input | Expected Result |

## 18. Deployment

Explain deployment requirements.

Do not invent deployment infrastructure.

## 19. Security Considerations

Identify actual security practices
and possible risks visible from the project.

## 20. Troubleshooting

Create practical troubleshooting steps
based on actual project dependencies.

## 21. Future Scope

Suggest realistic improvements,
but clearly label them as future enhancements.

## 22. Conclusion

Provide a professional conclusion.

==================================================
IMPORTANT RULES
==================================================

1. Do NOT invent features.
2. Do NOT invent APIs.
3. Do NOT invent database tables.
4. Do NOT invent technologies.
5. Do NOT invent authentication systems.
6. Analyze the actual source code.
7. If information is unavailable write "Not specified."
8. Clearly distinguish current functionality from future scope.
9. Use professional technical language.
10. Use Markdown formatting.
11. Use tables where useful.
12. Use code blocks for commands and code.
13. Make the documentation suitable for developers,
technical evaluators and academic project presentation.

Return ONLY the final documentation.
`;


    try {

        // Update status
        statusTitle.innerText =
            "Understanding project architecture...";

        statusText.innerText =
            "Analyzing modules, dependencies and data flow";


        // Gemini API request
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },

                body: JSON.stringify({

                    contents: [

                        {
                            role: "user",

                            parts: [

                                {
                                    text: prompt
                                }

                            ]
                        }

                    ]

                })
            }
        );


        const data =
            await response.json();


        // API error
        if (!response.ok) {

            console.error(
                "Gemini API Error:",
                data
            );

            output.innerHTML = `
                <h2>❌ API Error</h2>

                <pre>${escapeHTML(
                    JSON.stringify(data, null, 2)
                )}</pre>
            `;

            statusBox.classList.add("hidden");

            return;
        }


        // Check response
        if (
            !data.candidates ||
            !data.candidates[0] ||
            !data.candidates[0].content
        ) {

            output.innerHTML =
                "❌ Gemini returned an unexpected response.";

            statusBox.classList.add("hidden");

            return;
        }


        // Extract text
        const text =
            data.candidates[0]
                .content
                .parts
                .map(part => part.text || "")
                .join("\n");


        generatedDocumentation =
            text;


        // Update status
        statusTitle.innerText =
            "Documentation generated successfully!";

        statusText.innerText =
            "Your technical documentation is ready";


        // Render documentation
        output.innerHTML =
            markdownToHTML(text);


        // Hide status after short delay
        setTimeout(() => {

            statusBox.classList.add("hidden");

        }, 1800);


    } catch (error) {

        console.error(error);

        output.innerHTML = `
            <h2>❌ Connection Error</h2>

            <p>
                ${escapeHTML(error.message)}
            </p>

            <p style="color:#8994aa;margin-top:10px;">
                Check your internet connection and Gemini API key.
            </p>
        `;

        statusBox.classList.add("hidden");
    }
}



// =====================================================
// MARKDOWN → HTML
// =====================================================

function markdownToHTML(text) {

    let html =
        escapeHTML(text);


    // Code blocks
    html =
        html.replace(
            /```([\s\S]*?)```/g,
            function(match, code) {

                return `
                    <pre><code>${code.trim()}</code></pre>
                `;
            }
        );


    // Headings
    html =
        html.replace(
            /^### (.*)$/gm,
            "<h3>$1</h3>"
        );

    html =
        html.replace(
            /^## (.*)$/gm,
            "<h2>$1</h2>"
        );

    html =
        html.replace(
            /^# (.*)$/gm,
            "<h1>$1</h1>"
        );


    // Bold
    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // Inline code
    html =
        html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    // Horizontal line
    html =
        html.replace(
            /^---$/gm,
            "<hr>"
        );


    // Bullet points
    html =
        html.replace(
            /^\* (.*)$/gm,
            "• $1<br>"
        );

    html =
        html.replace(
            /^- (.*)$/gm,
            "• $1<br>"
        );


    // Numbered lists
    html =
        html.replace(
            /^(\d+)\. (.*)$/gm,
            "$1. $2<br>"
        );


    // Line breaks
    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;
}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}



// =====================================================
// COPY DOCUMENTATION
// =====================================================

async function copyDocumentation() {

    if (!generatedDocumentation) {

        alert(
            "Please generate documentation first."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            generatedDocumentation
        );

        alert(
            "✅ Documentation copied!"
        );

    } catch (error) {

        alert(
            "❌ Unable to copy documentation."
        );
    }
}



// =====================================================
// DOWNLOAD MARKDOWN FILE
// =====================================================

function downloadDoc() {

    if (!generatedDocumentation) {

        alert(
            "Please generate documentation first."
        );

        return;
    }


    const projectName =
        document.getElementById("projectName")
            .value
            .trim()
            .replace(/[^a-z0-9]/gi, "-");


    const fileName =
        (projectName || "technical-documentation") +
        "-documentation.md";


    const blob =
        new Blob(
            [generatedDocumentation],
            {
                type: "text/markdown"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;

    link.download =
        fileName;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}



// =====================================================
// LOAD DEMO PROJECT
// =====================================================

function loadDemo() {

    document.getElementById("projectName").value =
        "Student Management System";


    document.getElementById("techStack").value =
        "Java, MySQL, JDBC";


    document.getElementById("description").value =
        `A Java based Student Management System that allows users to add, view, update and delete student records using a MySQL database.`;


    document.getElementById("sourceCode").value =
`import java.sql.*;
import java.util.Scanner;

public class StudentManagementSystem {

    static final String URL =
        "jdbc:mysql://localhost:3306/studentdb";

    static final String USER = "root";
    static final String PASSWORD = "root";

    static Connection connect()
            throws SQLException {

        return DriverManager.getConnection(
            URL,
            USER,
            PASSWORD
        );
    }

    static void addStudent(
            String name,
            int age,
            String course) {

        String sql =
            "INSERT INTO students(name, age, course) VALUES (?, ?, ?)";

        try (
            Connection con = connect();
            PreparedStatement ps =
                con.prepareStatement(sql)
        ) {

            ps.setString(1, name);
            ps.setInt(2, age);
            ps.setString(3, course);

            ps.executeUpdate();

            System.out.println(
                "Student added successfully!"
            );

        } catch (SQLException e) {

            System.out.println(
                "Error: " + e.getMessage()
            );
        }
    }

    static void viewStudents() {

        String sql =
            "SELECT * FROM students";

        try (
            Connection con = connect();
            Statement st =
                con.createStatement();
            ResultSet rs =
                st.executeQuery(sql)
        ) {

            while (rs.next()) {

                System.out.println(
                    rs.getInt("id") + " | " +
                    rs.getString("name") + " | " +
                    rs.getInt("age") + " | " +
                    rs.getString("course")
                );
            }

        } catch (SQLException e) {

            System.out.println(
                "Error: " + e.getMessage()
            );
        }
    }

    static void updateStudent(
            int id,
            String name,
            int age,
            String course) {

        String sql =
            "UPDATE students SET name=?, age=?, course=? WHERE id=?";

        try (
            Connection con = connect();
            PreparedStatement ps =
                con.prepareStatement(sql)
        ) {

            ps.setString(1, name);
            ps.setInt(2, age);
            ps.setString(3, course);
            ps.setInt(4, id);

            ps.executeUpdate();

            System.out.println(
                "Student updated successfully!"
            );

        } catch (SQLException e) {

            System.out.println(
                "Error: " + e.getMessage()
            );
        }
    }

    static void deleteStudent(int id) {

        String sql =
            "DELETE FROM students WHERE id=?";

        try (
            Connection con = connect();
            PreparedStatement ps =
                con.prepareStatement(sql)
        ) {

            ps.setInt(1, id);

            ps.executeUpdate();

            System.out.println(
                "Student deleted successfully!"
            );

        } catch (SQLException e) {

            System.out.println(
                "Error: " + e.getMessage()
            );
        }
    }

    public static void main(String[] args) {

        Scanner sc =
            new Scanner(System.in);

        while (true) {

            System.out.println(
                "--- Student Management System ---"
            );

            System.out.println("1. Add Student");
            System.out.println("2. View Students");
            System.out.println("3. Update Student");
            System.out.println("4. Delete Student");
            System.out.println("5. Exit");

            System.out.print(
                "Enter choice: "
            );

            int choice =
                sc.nextInt();

            sc.nextLine();

            switch (choice) {

                case 1:

                    System.out.print(
                        "Enter name: "
                    );

                    String name =
                        sc.nextLine();

                    System.out.print(
                        "Enter age: "
                    );

                    int age =
                        sc.nextInt();

                    sc.nextLine();

                    System.out.print(
                        "Enter course: "
                    );

                    String course =
                        sc.nextLine();

                    addStudent(
                        name,
                        age,
                        course
                    );

                    break;


                case 2:

                    viewStudents();

                    break;


                case 3:

                    System.out.print(
                        "Enter student ID: "
                    );

                    int updateId =
                        sc.nextInt();

                    sc.nextLine();

                    System.out.print(
                        "Enter new name: "
                    );

                    String newName =
                        sc.nextLine();

                    System.out.print(
                        "Enter new age: "
                    );

                    int newAge =
                        sc.nextInt();

                    sc.nextLine();

                    System.out.print(
                        "Enter new course: "
                    );

                    String newCourse =
                        sc.nextLine();

                    updateStudent(
                        updateId,
                        newName,
                        newAge,
                        newCourse
                    );

                    break;


                case 4:

                    System.out.print(
                        "Enter student ID: "
                    );

                    int deleteId =
                        sc.nextInt();

                    deleteStudent(
                        deleteId
                    );

                    break;


                case 5:

                    System.out.println(
                        "Thank you!"
                    );

                    sc.close();

                    return;


                default:

                    System.out.println(
                        "Invalid choice!"
                    );
            }
        }
    }
}`;
}