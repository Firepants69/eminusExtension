// No es necesario declarar `element` dos veces, ya está al principio

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


        const newCourses = data.filter(course => new Date(course.curso.fechaTermino) > new Date());

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
            throw new Error('Error al obtener los cursos');
        }

        const data = await response.json();
        const newActivities = data.filter(activity => new Date(activity?.fechaTermino) > new Date());
        return newActivities;
    } catch (error) {
        console.log(error)
    }
}

const getAllActivies = async (token) => {
    const courses = await getAsyncCourses(token);
    let activities = []
    for (const course of courses) {
        const courseActivie = await getActivitiesForCourseAsync(token, course?.curso?.idCurso);

        const newCouserActivie = courseActivie.map(activity => ({ ...activity, course_title: course?.curso?.nombre }))

        activities.push(...newCouserActivie);
    }
    return activities
}


// select the div 
var divs = document.getElementsByClassName('container_courses w-100 mt-2 border-top');
if (divs.length > 0) {
    var favs = divs[0];

    // create a new element to show activities
    var principalDiv = document.createElement('div');

    // styles used
    const style = document.createElement('style');
    style.innerHTML = `
        .principal {
            color: black;
            display: flex;
            justify-content: start; 
            align-items: start;
            flex-direction: column;
            padding: 15px;
        }

        .loader-div {
            color: black;
            display: flex;
            justify-content: center; 
            align-items: center;
            flex-direction: column;
            padding: 15px;
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

    // use classes
    principalDiv.classList.add('principal');

    const title = document.createElement('span')
    title.textContent = "Tareas pendientes"
    title.style.fontSize = "1.42857rem";
    title.style.paddingLeft = "8px";
    title.style.fontWeight = "bold";
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
    console.log("Token:", token);
    getAllActivies(token).then((data) => {
        if (data.length === 0) {
            const noData = document.createElement('span');
            noData.textContent = "Estás al día";
            noData.style.color = "rgb(164, 164, 164)"
            loading.remove();
            loadingDiv.appendChild(noData);
        } else {
            loadingDiv.remove();
        }
        data.forEach(activity => {
            // div container each activitie
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
            infoDiv.innerHTML = `
            <p><strong>Curso:</strong> ${activity.course_title}</p>
            <p><strong>Título:</strong> ${activity.titulo}</p>
            <p><strong>Fecha de Creación:</strong> ${dateEstatusStr}</p>
            <p><strong>Fecha de Máxima:</strong> ${maxDateStr}</p>
            `;


            activityDiv.appendChild(infoDiv)
            principalDiv.appendChild(activityDiv);
        });
    })

    favs.insertBefore(principalDiv, favs.firstChild);
} else {
    console.log('No elements with this class');
}



