import {Component} from '@angular/core';

import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  status = ['Registrado', 'Tomado', 'En progreso', 'En espera', 'Finalizado'];
  fondo = ['#006A3D', '#DB963F', '#8E171A'];
  fondoEstatus = ['#e66100', '#8E171A', '#DB963F', '#e66100', '#006A3D', '#e66100'];
  correos = ['idania.gomez@csh.udg.mx', 'juan.mancilla@csh.udg.mx', 'hiram.franco@csh.udg.mx', 'ricardo.cortes@csh.udg.mx',
    'oscar.mendez@csh.udg.mx', 'teresa.dlsantos@csh.udg.mx', 'deleon.jonathan@csh.udg.mx', 'jose.carrillom@csh.udg.mx',
    'eduardo.solano@redudg.udg.mx', 'octavio.cortazar@csh.udg.mx', 'oswaldo.mendoza@csh.udg.mx', 'elba.moralesg@csh.udg.mx'];
  incidente_seleccionado;
  incidentes: Observable<any[]>;
  clientes: Observable<any[]>;
  listaNombres = [];
  listaDependencias = [];
  listaCodigos = [];
  listaUbicaciones = [];
  listaTelefonos = [];
  listaCorreos = [];
  cliente;
  nivel = 0;
  int_prioridad = 1;
  check_prioridad_id;
  checkeado_por_otro = false;
  check_prioridad;
  textoTipoIncidente = 'Selecciona el tipo de incidente';
  progreso;
  selectedRow: number;
  tipoIncidenteSeleccionado;
  user: Observable<firebase.User>;
  proteccion: boolean;

  constructor(private readonly db: AngularFirestore, public afAuth: AngularFireAuth) {

    this.incidentes = db.collection('incidentes', ref => ref.orderBy('folio', 'desc')).snapshotChanges().map(actions => {
      let x = 0;
      return actions.map(a => {
        if (x === 0) {
          console.log(a);
          x++;
          this.eventoPresionado(a.payload.doc.data(), 0);
        }
        return a.payload.doc.data();
      });
    });

    this.clientes = db.collection('clientes').snapshotChanges().map(actions => {
      this.listaNombres = [];
      this.listaDependencias = [];
      this.listaCodigos = [];
      this.listaUbicaciones = [];
      this.listaTelefonos = [];
      this.listaCorreos = [];
      return actions.map(a => {
        this.listaCodigos.push(a.payload.doc.data().codigoDelCliente);
        this.listaNombres.push(a.payload.doc.data().nombreDelCliente);
        this.listaDependencias.push(a.payload.doc.data().dependenciaDelCliente);
        this.listaUbicaciones.push(a.payload.doc.data().ubicacionDelCliente);
        this.listaTelefonos.push(a.payload.doc.data().telefonoDelCliente);
        this.listaCorreos.push(a.payload.doc.data().correoElectronicoDelCliente);
        return a.payload.doc.data();
      });
    });

    this.clientes.subscribe();
    this.user = afAuth.authState;
  }

  cambiarTipoIncidente(v) {
    if (this.tipoIncidenteSeleccionado !== undefined) {
      this.tipoIncidenteSeleccionado.checked = false;
    }
    this.tipoIncidenteSeleccionado = v;
    if (v.checked) {
      if (v.id === 't1' || v.id === 't2' || v.id === 't3' || v.id === 't4' || v.id === 't5' || v.id === 't6' || v.id === 't7') {
        this.textoTipoIncidente = 'Taller de computo - ' + v.textContent;
      } else if (v.id === 't8' || v.id === 't9' || v.id === 't10' || v.id === 't11' || v.id === 't12') {
        this.textoTipoIncidente = 'Redes y telefonía - ' + v.textContent;
      } else if (v.id === 't13' || v.id === 't14' || v.id === 't15' || v.id === 't16' || v.id === 't17' ||
        v.id === 't18' || v.id === 't19' || v.id === 't20' || v.id === 't21' || v.id === 't22') {
        this.textoTipoIncidente = 'Multimedia - ' + v.textContent;
      } else if (v.id === 't23' || v.id === 't24' || v.id === 't25') {
        this.textoTipoIncidente = 'Administrativo - ' + v.textContent;
      } else if (v.id === 't26' || v.id === 't27' || v.id === 't28' ||
        v.id === 't29' || v.id === 't30' || v.id === 't31' || v.id === 't32' || v.id === 't33') {
        this.textoTipoIncidente = 'Administrativo - ' + v.textContent;
      }
    } else {
      this.textoTipoIncidente = 'Selecciona el tipo de incidente';
    }
  }

  cambiarPrioridad(v) {
    if (this.check_prioridad === undefined) {
      this.check_prioridad_id = v.id;
      this.check_prioridad = v;
    } else if (this.check_prioridad_id !== v.id) {
      if (v.checked) {
        this.checkeado_por_otro = true;
        this.check_prioridad.checked = false;
        this.check_prioridad_id = v.id;
        this.check_prioridad = v;
        if (v.id === 'prioridadBaja') {
          this.int_prioridad = 1;
        } else if (v.id === 'prioridadMedia') {
          this.int_prioridad = 2;
        } else if (v.id === 'prioridadAlta') {
          this.int_prioridad = 3;
        }
      }
    } else if (!this.checkeado_por_otro) {
      v.checked = true;
    } else {
      this.checkeado_por_otro = false;
    }
  }

  validarFormulario(codigo, nombre, dependencia, ubicacion, telefono, correo,
                    tipo_incidente, descripcion, inputTipoIncidente, dialog, toast, boton_registrar) {

    let hayError = false;
    boton_registrar.disabled = true;
    this.proteccion = true;

    if (nombre.value === undefined) {
      nombre.errorMessage = 'Introduce el nombre del cliente';
      nombre.invalid = true;
      hayError = true;
    } else {
      nombre.invalid = false;
    }

    if (dependencia.value === undefined) {
      dependencia.errorMessage = 'Introduce la dependencia a la que pertenece del cliente';
      dependencia.invalid = true;
      hayError = true;
    } else {
      dependencia.invalid = false;
    }

    if (ubicacion.value === undefined) {
      ubicacion.errorMessage = 'Introduce la ubicación del incidente';
      ubicacion.invalid = true;
      hayError = true;
    } else {
      ubicacion.invalid = false;
    }

    if (telefono.value === undefined) {
      telefono.errorMessage = 'Introduce un número teléfonico para contactar al cliente';
      telefono.invalid = true;
      hayError = true;
    } else {
      telefono.invalid = false;
    }

    if (correo.value === undefined) {
      correo.errorMessage = 'Introduce el correo electrónico del cliente';
      correo.invalid = true;
      hayError = true;
    } else {
      correo.invalid = false;
    }

    if (descripcion.value === undefined) {
      descripcion.errorMessage = 'Introduce la descripción del incidente';
      descripcion.invalid = true;
      hayError = true;
    } else {
      descripcion.invalid = false;
    }

    console.log(tipo_incidente.textContent);
    if (tipo_incidente.textContent.trim() === 'Selecciona el tipo de incidente') {
      inputTipoIncidente.errorMessage = 'Selecciona el tipo de incidente';
      inputTipoIncidente.invalid = true;
      hayError = true;
    } else {
      inputTipoIncidente.invalid = false;
    }

    if (!hayError) {
      toast.text = 'Registrando incidente...';
      toast.open();

      // TRANSACCION
      const sfDocRef = this.db.collection('ultimo_id').doc('id');
      let int_ultimo_id;
      const dbf = this.db;
      const i_prioridad = this.int_prioridad;
      let u;
      this.user.subscribe(auth => {
        u = auth.displayName;
      });
      this.db.firestore.runTransaction(function (transaction) {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(sfDocRef.ref).then(function (sfDoc) {
          int_ultimo_id = sfDoc.data().id + 1;
          transaction.update(sfDocRef.ref, {id: int_ultimo_id});
        });
      }).then(function () {
        // TRANSACCION CORRECTA

        // Get a new write batch
        const batch = dbf.firestore.batch();

        // Poner la informacion del incidente
        const incRef = dbf.firestore.collection('incidentes').doc('incidente' + int_ultimo_id);
        const incidenteData = {
          areas: {
            taller: (tipo_incidente.textContent.includes('Taller de computo -')
              || tipo_incidente.textContent.includes('Aviso - Taller de computo')
              || tipo_incidente.textContent.includes('Aviso - Aviso general')
              || tipo_incidente.textContent.includes('Aviso - Redes y Taller')
              || tipo_incidente.textContent.includes('Aviso - Taller y Multimedia')),

            redes: (tipo_incidente.textContent.includes('Redes y telefonía -')
              || tipo_incidente.textContent.includes('Aviso - Redes y telefonía')
              || tipo_incidente.textContent.includes('Aviso - Aviso general')
              || tipo_incidente.textContent.includes('Aviso - Redes y Taller')
              || tipo_incidente.textContent.includes('Aviso - Aviso - Redes y Multimedia')),

            multimedia: (tipo_incidente.textContent.includes('Multimedia - ')
              || tipo_incidente.textContent.includes('Aviso - Multimedia')
              || tipo_incidente.textContent.includes('Aviso - Aviso general')
              || tipo_incidente.textContent.includes('Aviso - Taller y Multimedia')
              || tipo_incidente.textContent.includes('Aviso - Aviso - Redes y Multimedia')),

            belenes: tipo_incidente.textContent.includes('Aviso - Aviso general')
          },
          codigoCliente: codigo.value === undefined ? 'No proporcionado' : codigo.value,
          descripcionDelReporte: descripcion.value,
          estatus: 0,
          fecha: new Date().getTime(),
          folio: int_ultimo_id,
          prioridad: i_prioridad,
          quienRegistro: u,
          tecnico: 'No asignado',
          tipoDeIncidente: tipo_incidente.textContent
        };

        // Poner la informacion del cliente
        const clienteRef = dbf.firestore.collection('clientes')
          .doc('cliente' + (codigo.value === undefined ? 'No proporcionado' : codigo.value));
        const clienteData = {
          codigoDelCliente: codigo.value === undefined ? 'No proporcionado' : codigo.value,
          correoElectronicoDelCliente: correo.value,
          dependenciaDelCliente: dependencia.value,
          nombreDelCliente: nombre.value,
          telefonoDelCliente: telefono.value,
          ubicacionDelCliente: ubicacion.value
        };

        // Poner la informacion del progreso
        const progresoRef = dbf.firestore.collection('incidentes').doc('incidente' + int_ultimo_id).collection('progreso').doc();
        const progresoData = {
          mensaje: null,
          nombre: u,
          progreso: 0,
          timestamp: new Date().getTime()
        };

        // Poner la informacion del incidente anidado al cliente
        const clienteIncRef = dbf.firestore.collection('clientes')
          .doc(('cliente' + codigo.value === undefined ? 'No proporcionado' : codigo.value) + '/incidentes/incidente' + int_ultimo_id);

        batch.set(clienteRef, clienteData);
        batch.set(clienteIncRef, incidenteData);
        batch.set(incRef, incidenteData);
        batch.set(progresoRef, progresoData);

        batch.commit().then(function () {
          dialog.close();
          toast.text = 'Se ha registrado el incidente con folio ' + int_ultimo_id;
          toast.open();
        }).catch(function (error) {
          console.log(error);
          toast.text = 'A ocurrido un problema. Intentalo nuevamente';
          toast.open();
        });

      }).catch(function (error) {
        console.log(error);
        toast.text = 'A ocurrido un problema. Intentalo nuevamente';
        toast.open();
      });
    } else {
      boton_registrar.disabled = false;
      this.proteccion = false;
    }

  }

  nombreSeleccionado(v, codigo, dependencia, ubicacion, telefono, correo) {
    for (let x = 0; x < this.listaNombres.length; x++) {
      if (this.listaNombres[x] === v.value) {
        codigo.value = this.listaCodigos[x];
        dependencia.value = this.listaDependencias[x];
        ubicacion.value = this.listaUbicaciones[x];
        telefono.value = this.listaTelefonos[x];
        correo.value = this.listaCorreos[x];
        break;
      }
    }
  }

  codigoSeleccionado(v, nombre, dependencia, ubicacion, telefono, correo) {
    for (let x = 0; x < this.listaCodigos.length; x++) {
      if (this.listaCodigos[x] === v) {
        nombre.value = this.listaNombres[x];
        dependencia.value = this.listaDependencias[x];
        ubicacion.value = this.listaUbicaciones[x];
        telefono.value = this.listaTelefonos[x];
        correo.value = this.listaCorreos[x];
        break;
      }
    }
  }

  login(email, password, login_dialog, toast_bienvenido) {
    this.afAuth.auth.signInWithEmailAndPassword(email.value, password.value).catch(function (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('error code: ' + errorCode + ' error menssage: ' + errorMessage);
      switch (errorCode) {
        case 'auth/user-not-found':
          email.errorMessage = 'No hay ningun usuario registrado con ese correo electrónico';
          email.invalid = true;
          break;
        case 'auth/invalid-email':
          email.errorMessage = 'El correo electrónico esta mal escrito';
          email.invalid = true;
          break;
        case 'auth/wrong-password':
          password.errorMessage = 'La contraseña que ingresaste es incorrecta';
          password.invalid = true;
          break;
      }
    }).then(function (user) {
      if (user) {
        login_dialog.close();
        email.value = '';
        email.invalid = false;
        password.value = '';
        password.invalid = false;
        toast_bienvenido.text = 'Bienvenido ' + user.displayName;
        toast_bienvenido.open();
      } else {
        // No user is signed in.
      }
    });
  }

  eventoPresionado(i, index) {
    this.selectedRow = index;
    this.incidente_seleccionado = i;
    this.cliente = this.db.collection('clientes', ref => ref.where('codigoDelCliente', '==',
      this.incidente_seleccionado.codigoCliente).limit(1)).valueChanges().flatMap(result => result);
    this.progreso = this.db.collection('incidentes/incidente' + i.folio + '/progreso', ref => ref.orderBy(
      'timestamp', 'asc')).valueChanges();
  }

  logoutDialog(avatar, dialog) {
    dialog.positionTarget = avatar;
    dialog.open();
  }

  getNivel(mail) {
    switch (mail) {
      case 'idania.gomez@csh.udg.mx':
        return 3;
      case 'eduardo.solano@redudg.udg.mx':
        return 3;
      case 'oscar.mendez@csh.udg.mx':
        return 2;
      case 'hiram.franco@csh.udg.mx':
        return 1;
      case 'roberto_028@outlook.com':
        return 1;
      case 'juan.mancilla@csh.udg.mx':
        return 1;
      case 'ricardo.cortes@csh.udg.mx':
        return 1;
      case 'teresa.dlsantos@csh.udg.mx':
        return 2;
      case 'deleon.jonathan@csh.udg.mx':
        return 2;
      case 'jose.carrillom@csh.udg.mx':
        return 1;
      case 'octavio.cortazar@csh.udg.mx':
        return 1;
      case 'oswaldo.mendoza@csh.udg.mx':
        return 1;
      case 'elba.moralesg@csh.udg.mx':
        return 2;
      default:
        return 0;
    }
  }

  logout(dialog, toast) {
    this.afAuth.auth.signOut();
    dialog.close();
    toast.open();
    this.nivel = 0;
  }

  cambioPagina(selected: number) {
    switch (selected) {
      case 0: {
        this.incidentes = this.db.collection('incidentes', ref => ref.orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          return actions.map(a => {
            if (a.payload.newIndex === 0) {
              this.eventoPresionado(a.payload.doc.data(), 0);
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 1: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.redes', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          return actions.map(a => {
            if (a.payload.newIndex === 0) {
              this.eventoPresionado(a.payload.doc.data(), 0);
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 2: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.taller', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          return actions.map(a => {
            if (a.payload.newIndex === 0) {
              this.eventoPresionado(a.payload.doc.data(), 0);
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 3: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.multimedia', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          return actions.map(a => {
            if (a.payload.newIndex === 0) {
              this.eventoPresionado(a.payload.doc.data(), 0);
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 4: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.belenes', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          return actions.map(a => {
            if (a.payload.newIndex === 0) {
              this.eventoPresionado(a.payload.doc.data(), 0);
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
    }
  }

  abrirDialogoCrearIncidente(dialog) {
    this.textoTipoIncidente = 'Selecciona el tipo de incidente';
    this.proteccion = false;
    dialog.open();
  }
}
