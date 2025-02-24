var info = {
    activities: [],
    forums: [],
    exams: [],
};

const getAsyncCourses = async (token) => {
    const url = 'https://eminus.uv.mx/eminusapi/api/Cursos/getAllCourses';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los cursos');
        }

        const data = await response.json();
        console.log(data);

        const newCourses = data.filter(course => new Date(course.curso.fechaTermino) > new Date());

        info.courses = newCourses;

        return newCourses;
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
    }
};

const getActivitiesForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Actividad/getActividadesEstudiante/${courseId}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();
        console.log(data);
        const newActivities = data.filter(activity => new Date(activity?.fechaTermino) > new Date());
        return newActivities;
    } catch (error) {
        console.log(error)
        return [];
    }
}


const getForumsForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Foro/getForos/${courseId}/0`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();
        console.log("foros: ", data);
    } catch (error) {
        console.log(error)
    }
}

const getExamsForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Examen/getExamenesEst/${courseId}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();
        console.log("foros: ", data);
    } catch (error) {
        console.log(error)
    }
}

const getAllActivies = async (token) => {
    try {
        var courses;

        if (info.courses != undefined) {
            courses = info.courses
        } else {
            courses = await getAsyncCourses(token);
        }
        let activities = []
        for (const course of courses) {
            const courseActivie = await getActivitiesForCourseAsync(token, course?.curso?.idCurso);

            const newCouserActivie = courseActivie.map(activity => ({ ...activity, course_title: course?.curso?.nombre }))

            activities.push(...newCouserActivie);
        }

        info.activities.push(...activities);
        console.log("actividades", info.activities)
        return activities;
    } catch {
        return [];
    }
}

const onClickActivity = (courseId, activityId) => {
    const config = {
        config: {
            demo: "default",
            navegation: {
                course: {
                    id: courseId,
                    permission: 2,
                    unit: 0,
                    activity: activityId,
                    forum: 0,
                    exam: 0,
                    view_student: false,
                    type: 2
                },
                forum: {
                    comment: 0
                },
                member: {
                    user: ""
                },
                tracing: {
                    user: ""
                },
                exam: {
                    id: "",
                    ending: ""
                }
            }
        }
    };
    localStorage.setItem('layoutConfigNavegation', JSON.stringify(config));
    localStorage.setItem('changeActivityId', activityId);
    window.location.assign('https://eminus.uv.mx/eminus4/page/course/activity/delivery');
}


// select the div 
const main = () => {
    var divs = document.getElementsByClassName('container_courses w-100 mt-2 border-top');
    if (divs.length > 0) {
        var favs = divs[0];

        // create a new element to show activities
        var principalDiv = document.createElement('div');
        principalDiv.id = "principalId";

        if (document.getElementById("principalId") != null) {

            return;

        }
        // styles used
        const style = document.createElement('style');
        style.innerHTML = `
            .principal {
                color: black;
                display: flex;
                justify-content: start; 
                align-items: start;
                flex-direction: column;
                padding: 8px;
            }
    
            .loader-div {
                color: black;
                display: flex;
                justify-content: center; 
                align-items: center;
                flex-direction: column;
                padding: 15px;
            }
            .
            .title-activity{
               
                color: black;
            }
            .title-activity:hover {
                color: #575656;
            }

            .title-activity-alert{
               
                color: red;
            }
            .title-activity-alert:hover {
                color:#EE6666;
            }

            .loader {
            width: 50px;
            padding: 8px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: rgb(13, 71, 161);
            --_m: 
                conic-gradient(#0000 10%,#000),
                linear-gradient(#000 0 0) content-box;
            -webkit-mask: var(--_m);
                    mask: var(--_m);
            -webkit-mask-composite: source-out;
                    mask-composite: subtract;
            animation: l3 1s infinite linear;
            }
            @keyframes l3 {to{transform: rotate(1turn)}}
        `;
        // add style to head
        document.head.appendChild(style);



        principalDiv.classList.add('principal');
        principalDiv.style.marginBottom = "20px"
        const title = document.createElement('span')
        title.textContent = "Tareas pendientes"
        title.style.fontSize = "1.42857rem";
        title.style.paddingLeft = "8px";
        title.style.fontWeight = "600";
        title.style.marginBottom = "15px"


        const loadingDiv = document.createElement('div')
        loadingDiv.classList.add('loader-div');
        loadingDiv.style.width = "100%";
        const loading = document.createElement('div')

        loading.classList.add('loader');
        principalDiv.appendChild(title)
        principalDiv.appendChild(loadingDiv)
        loadingDiv.appendChild(loading)

        const token = localStorage.getItem('accessToken');
        getForumsForCourseAsync(token, 76446);
        getExamsForCourseAsync(token, 76446);
        getAllActivies(token).then((data) => {
            const activitiesDiv = document.createElement('div');
            if (data.length === 0) {
                const noData = document.createElement('span');
                noData.textContent = "Estás al día";
                noData.style.color = "rgb(164, 164, 164)"
                loading.remove();
                activitiesDiv.remove()

                loadingDiv.appendChild(noData);
            } else {
                loadingDiv.remove();
                activitiesDiv.classList.add('principal');
                activitiesDiv.style.overflowX = "hidden";
                activitiesDiv.style.overflowY = "auto";
                activitiesDiv.style.maxHeight = "400px";
                activitiesDiv.style.width = "100%";

                principalDiv.appendChild(activitiesDiv);

            }
            const pendingactivities = [
                ...data
                    .filter(info => !info.estadoEntrega)
                    .sort((a, b) => new Date(a.fechaTermino) - new Date(b.fechaTermino))
                , ...data.filter(info => info.estadoEntrega == 1)
            ]

            pendingactivities.forEach(activity => {
                // div container each activity
                const activityDiv = document.createElement('div');
                activityDiv.className = "CourseList col-12 d-flex p-3 mb-3 mat-card ng-star-inserted";
                activityDiv.style.borderRadius = "10px"
                const infoDiv = document.createElement('div')
                infoDiv.className = "d-flex flex-column"
                const dateEstatus = new Date(activity.fechaEstatus); // to str
                const maxDate = new Date(activity?.fechaTermino)
                const maxDateStr = maxDate.toLocaleString(); // to str
                const dateEstatusStr = dateEstatus.toLocaleString(); // to str

                // Create the div content
                const titleActivity = document.createElement('p');
                titleActivity.textContent = activity.titulo
                titleActivity.style.fontWeight = "bold";
                titleActivity.style.fontSize = "1.45rem";
                titleActivity.style.cursor = "pointer";

                const oneDay = 24 * 60 * 60 * 1000;
                let difDays = Math.round(Math.abs((maxDate - new Date()) / oneDay));
                console.log(difDays);

                //alert 
                difDays <= 2 ? titleActivity.classList.add('title-activity-alert') : titleActivity.classList.add('title-activity');

                titleActivity.addEventListener('click', () =>
                    onClickActivity(activity?.idCurso, activity?.idActividad));

                infoDiv.innerHTML = `
                <p><strong>Días para que termine:</strong> ${difDays}</p>
                <p><strong>Curso:</strong> ${activity.course_title}</p>
                ${activity.estadoEntrega ?
                        `<p><strong style="margin-right: 10px;">Con entrega</strong><span style="color:green; font-weight: 900;">&#10004;</span></p>`
                        :
                        `<p><strong style="margin-right: 10px;">Sin entrega</strong><span style="color:red; font-weight: 900;">x</span></p>`
                    }
                  
                <p><strong>Fecha de Creación:</strong> ${dateEstatusStr}</p>
                <p><strong>Fecha de Máxima:</strong> ${maxDateStr}</p>
                <p><strong>Descripcion:</strong> </p>
                
                ${activity?.descripcion}
                `;

                infoDiv.insertBefore(titleActivity, infoDiv.firstChild);
                activityDiv.appendChild(infoDiv)
                activitiesDiv.appendChild(activityDiv);
            });
        })

        favs.insertBefore(principalDiv, favs.firstChild);
    } else {
        console.log('No elements with this class');
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "urlChange") {
        console.log("La URL ha cambiado, realizando acción en la página...");
        main()
    }
});

