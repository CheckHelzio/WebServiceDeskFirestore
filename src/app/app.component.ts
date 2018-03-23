import {Component, OnInit, ViewChild} from '@angular/core';

import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import * as firebase from 'firebase';
import {MessagingService} from './messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  editando = false;
  status = ['Registrado', 'Tomado', 'En progreso', 'En espera', 'Finalizado', 'Reabierto', 'Asignado', 'Editado', 'Compartido'];
  fondo = ['#006A3D', '#DB963F', '#8E171A'];
  fondoEstatus = ['#e66100', '#8E171A', '#DB963F', '#e66100', '#006A3D', '#e66100', '#02a9e6', '#6d0085', '#6d0085'];
  correos = ['idania.gomez@csh.udg.mx', 'juan.mancilla@csh.udg.mx', 'hiram.franco@csh.udg.mx', 'ricardo.cortes@csh.udg.mx',
    'oscar.mendez@csh.udg.mx', 'teresa.dlsantos@csh.udg.mx', 'deleon.jonathan@csh.udg.mx', 'jose.carrillom@csh.udg.mx',
    'eduardo.solano@redudg.udg.mx', 'octavio.cortazar@csh.udg.mx', 'oswaldo.mendoza@csh.udg.mx', 'elba.moralesg@csh.udg.mx',
    'eduardo.salazar@csh.udg.mx', 'emmanuelchacon_1@csh.udg.mx', 'zyanya.lopez@csh.udg.mx', 'kenya.andrade@csh.udg.mx',
    'roberto.villasenor@redudg.udg.mx', 'jose.crubio@csh.udg.mx', 'edgar.orozco@csh.udg.mx', 'alberto.franco@csh.udg.mx',
    'checkhelzio@gmail.com',
    'jorge.plascencia@redudg.udg.mx',
    'invitado@gmail.com'];
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
  message;
  paginaSeleccionada = 0;
  nivel = 0;
  int_prioridad = 1;
  check_prioridad_id;
  presionado = false;
  checkeado_por_otro = false;
  private _messaging: firebase.messaging.Messaging;
  check_prioridad;
  textoTipoIncidenteReal = 'Selecciona el tipo de incidente';
  textoTipoIncidente = '';
  progreso;
  selectedRow: number;
  tipoIncidenteSeleccionado;
  user: Observable<firebase.User>;
  proteccion: boolean;
  listaAsignados = [];
  filtro_registrado = true;
  filtro_tomados = true;
  filtro_en_progreso = true;
  filtro_en_espera = true;
  filtro_finalizados = false;
  filtro_reabiertos = true;
  filtro_asignados = true;
  filtro_prioridad_baja = true;
  filtro_prioridad_media = true;
  filtro_prioridad_alta = true;
  textoBelenes = '';
  nombreLogeo;
  encontrado = true;
  @ViewChild('lista_mensaje') lista_mensaje: any;
  @ViewChild('pager') pager: any;
  @ViewChild('loginDialog') dialogIniciarSesion: any;
  busqueda = '';


  constructor(private readonly db: AngularFirestore, public afAuth: AngularFireAuth, public msg: MessagingService) {
    this._messaging = firebase.messaging();
  }

  filtrarIncidente(incidente) {

    /*if (this.paginaSeleccionada === 1 || this.paginaSeleccionada === 2 || this.paginaSeleccionada === 3) {
      if (incidente.tipoDeIncidente.includes('Belenes')) {
        return false;
      }
    }
*/
    if (this.filtro_registrado && incidente.estatus === 0 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_tomados && incidente.estatus === 1 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_en_progreso && incidente.estatus === 2 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_en_espera && incidente.estatus === 3 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_finalizados && incidente.estatus === 4 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_reabiertos && incidente.estatus === 5 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (this.filtro_asignados && incidente.estatus === 6 && this.filtrarPrioridad(incidente)) {
      return this.comprobarBusqueda(incidente);
    }

    if (incidente.estatus === 8) {
      return this.comprobarBusqueda(incidente);
    }

    return false;
  }

  comprobarBusqueda(incidente) {
    if (this.busqueda !== '') {
      return (('' + incidente.codigoCliente).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.dependenciaDelCliente).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.descripcionDelReporte).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.folio).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.quienRegistro).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.tipoDeIncidente).toLowerCase().includes(this.busqueda) ||
        ('' + incidente.ubicacionDelCliente).toLowerCase().includes(this.busqueda)
      );
    } else {
      return true;
    }
  }

  private filtrarPrioridad(incidente: any) {
    if (this.filtro_prioridad_baja && incidente.prioridad === 1) {
      return true;
    }

    if (this.filtro_prioridad_media && incidente.prioridad === 2) {
      return true;
    }

    if (this.filtro_prioridad_alta && incidente.prioridad === 3) {
      return true;
    }

    return false;
  }

  cambiarIncidenteEnBelenes(v) {
    if (v.checked === true) {
      this.textoBelenes = 'Belenes - ';
    } else {
      this.textoBelenes = '';
    }
    if (this.textoTipoIncidenteReal !== 'Selecciona el tipo de incidente') {
      this.textoTipoIncidenteReal = this.textoBelenes + this.textoTipoIncidente;
    } else {
      this.textoTipoIncidenteReal = 'Selecciona el tipo de incidente';
    }
  }

  desctivarCambio() {
    if (this.tipoIncidenteSeleccionado !== undefined) {
      this.tipoIncidenteSeleccionado.checked = false;
    }
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
      if (!this.editando) {
        this.textoTipoIncidente = 'Selecciona el tipo de incidente';
      }
    }

    if (this.textoTipoIncidente === 'Selecciona el tipo de incidente') {
      this.textoTipoIncidenteReal = this.textoTipoIncidente;
    } else {
      this.textoTipoIncidenteReal = this.textoBelenes + this.textoTipoIncidente;
    }
  }

  cambiarPrioridad(v) {
    if (!this.editando) {
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
    } else {
      if (this.check_prioridad === undefined) {
        switch (this.incidente_seleccionado.prioridad) {
          case 1:
            if (v.id === 'prioridadBaja') {
              this.check_prioridad_id = 'prioridadBaja';
              this.check_prioridad = v;
            }
            break;
          case 2:
            if (v.id === 'prioridadMedia') {
              this.check_prioridad_id = 'prioridadMedia';
              this.check_prioridad = v;
            }
            break;
          case 3:
            if (v.id === 'prioridadAlta') {
              this.check_prioridad_id = 'prioridadAlta';
              this.check_prioridad = v;
            }
            break;
        }
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
      const edit = this.editando;
      const i_seleccionado = this.incidente_seleccionado;
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
        const incidenteData = {
          areas: {
            taller: (tipo_incidente.textContent.includes('Taller de computo -') && !tipo_incidente.textContent.includes('Belenes')),
            redes: (tipo_incidente.textContent.includes('Redes y telefonía -') && !tipo_incidente.textContent.includes('Belenes')),
            multimedia: (tipo_incidente.textContent.includes('Multimedia - ') && !tipo_incidente.textContent.includes('Belenes')),
            belenes: tipo_incidente.textContent.includes('Belenes')
          },
          codigoCliente: codigo.value === undefined ? 'No proporcionado' : codigo.value,
          descripcionDelReporte: edit === true ? i_seleccionado.descripcionDelReporte : descripcion.value,
          estatus: edit === true ? i_seleccionado.estatus : 0,
          fecha: new Date().getTime(),
          folio: edit === true ? i_seleccionado.folio : int_ultimo_id,
          prioridad: i_prioridad,
          dependenciaDelCliente: dependencia.value,
          ubicacionDelCliente: ubicacion.value,
          progreso: edit === true ? i_seleccionado.progreso : {
            0: true,
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false
          },
          quienRegistro: u,
          tecnico: 'No asignado',
          tipoDeIncidente: tipo_incidente.textContent
        };

        const incRef = dbf.firestore.collection('incidentes').doc('incidente' + incidenteData.folio);

        // Poner la informacion del cliente
        let clienteRef;
        if (codigo.value !== undefined) {
          clienteRef = dbf.firestore.collection('clientes')
            .doc(codigo.value === undefined ? 'no_proporcionado' : 'cliente' + codigo.value);
        }

        const clienteData = {
          codigoDelCliente: codigo.value === undefined ? 'No proporcionado' : codigo.value,
          correoElectronicoDelCliente: correo.value,
          dependenciaDelCliente: dependencia.value,
          nombreDelCliente: nombre.value,
          telefonoDelCliente: telefono.value,
          ubicacionDelCliente: ubicacion.value
        };

        // Poner la informacion del progreso
        const progresoRef = dbf.firestore.collection('incidentes').doc('incidente' + incidenteData.folio).collection('progreso').doc();
        const progresoData = {
          mensaje: edit === true ? descripcion.value : null,
          nombre: u,
          progreso: edit === true ? 7 : 0,
          timestamp: new Date().getTime()
        };

        // Poner la informacion del incidente anidado al cliente
        let clienteIncRef;
        if (codigo.value !== undefined) {
          clienteIncRef = dbf.firestore.collection('clientes')
            .doc(('cliente' + '/incidentes/incidente' + int_ultimo_id));
        }

        if (edit === true) {
          if (codigo.value !== undefined) {
            batch.set(clienteRef, clienteData);
          }
          if (codigo.value !== undefined) {
            batch.set(clienteIncRef, incidenteData);
          }
          batch.update(incRef, incidenteData);
          batch.set(progresoRef, progresoData);
        } else {
          if (codigo.value !== undefined) {
            batch.set(clienteRef, clienteData);
          }
          if (codigo.value !== undefined) {
            batch.set(clienteIncRef, incidenteData);
          }
          batch.set(incRef, incidenteData);
          batch.set(progresoRef, progresoData);
        }

        batch.commit().then(function () {
          dialog.close();
          toast.text = 'Se ha registrado el incidente con folio ' + int_ultimo_id;
          toast.open();
        }).catch(function (error) {
          toast.text = 'A ocurrido un problema. Intentalo nuevamente';
          toast.open();
        });

      }).catch(function (error) {
        toast.text = 'A ocurrido un problema. Intentalo nuevamente';
        toast.open();
      });
    } else {
      boton_registrar.disabled = false;
      this.proteccion = false;
    }

  }

  nombreSeleccionado(v, codigo, dependencia, ubicacion, telefono, correo) {
    console.log('NOMBRE SELECCIONADO');
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
    console.log('CODIGO SELECCIONADO');
    console.log(v);
    if(v.trim() !== '') {
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

  }

  login(email, password, login_dialog, toast_bienvenido) {

    let nombre_usuario = this.nombreLogeo;
    const self = this; // save object reference;
    this.afAuth.auth.signInWithEmailAndPassword(email.value, password.value).catch(function (error) {
      const errorCode = error.code;
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
        nombre_usuario = user.displayName;
        toast_bienvenido.text = 'Bienvenido ' + user.displayName;
        toast_bienvenido.open();
        self.nombreLogeo = user.displayName;
        self.cambioPagina(self.descargarIncidentes(user.email));
      } else {
        // No user is signed in.
      }
    });
  }

  descargarIncidentes(mail) {
    switch (mail) {
      case 'idania.gomez@csh.udg.mx':
        return 0;
      case 'invitado@gmail.com':
        return 0;
      case 'eduardo.solano@redudg.udg.mx':
        return 0;
      case 'checkhelzio@gmail.com':
        return 0;
      case 'oscar.mendez@csh.udg.mx':
        return 0;
      case 'hiram.franco@csh.udg.mx':
        return 3;
      case 'roberto_028@outlook.com':
        return 2;
      case 'juan.mancilla@csh.udg.mx':
        return 2;
      case 'ricardo.cortes@csh.udg.mx':
        return 2;
      case 'teresa.dlsantos@csh.udg.mx':
        return 0;
      case 'deleon.jonathan@csh.udg.mx':
        return 0;
      case 'jose.carrillom@csh.udg.mx':
        return 1;
      case 'octavio.cortazar@csh.udg.mx':
        return 1;
      case 'elba.moralesg@csh.udg.mx':
        return 0;
      case 'zyanya.lopez@csh.udg.mx':
        return 3;
      case 'edgar.orozco@csh.udg.mx':
        return 1;
      case 'emmanuelchacon_1@csh.udg.mx':
        return 3;
      case 'eduardo.salazar@csh.udg.mx':
        return 3;
      case 'roberto.villasenor@redudg.udg.mx':
        return 2;
      case 'jose.crubio@csh.udg.mx':
        return 2;
      case 'alberto.franco@csh.udg.mx':
        return 4;
      case 'jorge.plascencia@redudg.udg.mx':
        return 4;
      default:
        return 0;
    }
  }

  eventoPresionado(i, index) {
    this.editando = false;
    this.encontrado = true;
    this.presionado = false;
    try {
      this.lista_mensaje.nativeElement.click();
    } catch (e) {
    }

    this.selectedRow = index;
    this.incidente_seleccionado = i;

    if (i !== null) {
      this.cliente = this.db.collection('clientes', ref => ref.where('codigoDelCliente', '==',
        this.incidente_seleccionado.codigoCliente).limit(1)).valueChanges().flatMap(result => result);
      this.progreso = this.db.collection('incidentes/incidente' + i.folio + '/progreso', ref => ref.orderBy(
        'timestamp', 'asc')).valueChanges();
      if (i.tecnicos !== undefined) {
        this.listaAsignados = i.tecnicos.slice();
      } else {
        this.listaAsignados = [];
      }
    }
  }

  logoutDialog(avatar, dialog) {
    dialog.positionTarget = avatar;
    dialog.open();
  }

  getNivel(mail) {
    switch (mail) {
      case 'idania.gomez@csh.udg.mx':
        return 3;
      case 'invitado@gmail.com':
        return -1;
      case 'eduardo.solano@redudg.udg.mx':
        return 3;
      case 'checkhelzio@gmail.com':
        return 3;
      case 'oscar.mendez@csh.udg.mx':
        return 3;
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
      case 'zyanya.lopez@csh.udg.mx':
        return 1;
      case 'edgar.orozco@csh.udg.mx':
        return 1;
      case 'emmanuelchacon_1@csh.udg.mx':
        return 1;
      case 'eduardo.salazar@csh.udg.mx':
        return 1;
      case 'roberto.villasenor@redudg.udg.mx':
        return 1;
      case 'roberto.villaseñor@redudg.udg.mx':
        return 1;
      case 'jose.crubio@csh.udg.mx':
        return 1;
      case 'kenya.andrade@csh.udg.mx':
        return 2;
      case 'alberto.franco@csh.udg.mx':
        return 2.5;
      case 'jorge.plascencia@redudg.udg.mx':
        return 2.5;
      default:
        return 0;
    }
  }

  logout(dialog, toast, dialogi) {
    this.afAuth.auth.signOut();
    this.nombreLogeo = undefined;
    this.incidente_seleccionado = null;
    dialog.close();
    toast.open();
    this.nivel = 0;
    dialogi.open();
  }

  cambioPagina(selected) {
    this.paginaSeleccionada = selected;
    switch (selected) {
      case 0: {
        this.incidentes = this.db.collection('incidentes', ref => ref.orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          let x = 0;
          return actions.map(a => {
            if (a.payload.doc.metadata.fromCache) {
              if (x === 0 && this.presionado) {
                if (this.filtrarIncidente(a.payload.doc.data())) {
                  x++;
                  this.presionado = false;
                  this.eventoPresionado(a.payload.doc.data(), a.payload.newIndex);
                }
              }
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 1: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.redes', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          let x = 0;
          return actions.map(a => {
            if (a.payload.doc.metadata.fromCache) {
              if (x === 0 && this.presionado) {
                if (this.filtrarIncidente(a.payload.doc.data())) {
                  x++;
                  this.presionado = false;
                  this.eventoPresionado(a.payload.doc.data(), a.payload.newIndex);
                }
              }
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 2: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.taller', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          let x = 0;
          return actions.map(a => {
            if (a.payload.doc.metadata.fromCache) {
              if (x === 0 && this.presionado) {
                if (this.filtrarIncidente(a.payload.doc.data())) {
                  x++;
                  this.presionado = false;
                  this.eventoPresionado(a.payload.doc.data(), a.payload.newIndex);
                }
              }
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 3: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.multimedia', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          let x = 0;
          if (this.incidente_seleccionado !== undefined) {
            this.encontrado = false;
          }
          return actions.map(a => {
            if (this.incidente_seleccionado !== undefined) {
              if (a.payload.doc.data().folio === this.incidente_seleccionado.folio) {
                this.encontrado = true;
              }
            }

            if (a.payload.doc.metadata.fromCache) {
              if (x === 0 && this.presionado) {
                if (this.filtrarIncidente(a.payload.doc.data())) {
                  x++;
                  this.presionado = false;
                  this.eventoPresionado(a.payload.doc.data(), a.payload.newIndex);
                }
              }
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
      case 4: {
        this.incidentes = this.db.collection('incidentes', ref => ref.where('areas.belenes', '==', true)
          .orderBy('folio', 'desc')).snapshotChanges().map(actions => {
          let x = 0;
          return actions.map(a => {
            if (a.payload.doc.metadata.fromCache) {
              if (x === 0 && this.presionado) {
                if (this.filtrarIncidente(a.payload.doc.data())) {
                  x++;
                  this.presionado = false;
                  this.eventoPresionado(a.payload.doc.data(), a.payload.newIndex);
                }
              }
            }
            return a.payload.doc.data();
          });
        });
        break;
      }
    }
  }

  abrirDialogoCrearIncidente(dialog) {
    this.editando = false;
    this.textoBelenes = '';
    this.textoTipoIncidenteReal = 'Selecciona el tipo de incidente';
    this.proteccion = false;
    dialog.open();
  }

  abrirDialogoEditarIncidente(dialog) {
    this.textoBelenes = '';
    this.proteccion = false;
    this.editando = true;
    this.check_prioridad = undefined;
    this.textoTipoIncidenteReal = this.incidente_seleccionado.tipoDeIncidente.trim();
    dialog.open();
  }

  borrarIncidente(toast, dialog, aceptar, cancelar) {
    aceptar.disabled = true;
    cancelar.disabled = true;
    const folio = this.incidente_seleccionado.folio;
    this.db.collection('incidentes').doc(('incidente' + folio)).delete().then(function () {
      toast.text = 'El incidente ' + folio + ' ha sido eliminado correctamente.';
      toast.open();
      dialog.close();
      aceptar.disabled = false;
      cancelar.disabled = false;
    }).catch(function (error) {
      toast.text = 'Ha ocurrido un problema al intentar eliminar el incidente... intentalo nuevamente';
      toast.open();
      dialog.close();
      aceptar.disabled = false;
      cancelar.disabled = false;
    });
  }

  tomarIncidente(toast, dialog, aceptar, cancelar) {
    aceptar.disabled = true;
    cancelar.disabled = true;

    let u;
    this.user.subscribe(auth => {
      u = auth.displayName;
    });

    const folio = this.incidente_seleccionado.folio;
    let tecnicos;
    if (this.incidente_seleccionado.tecnicos !== undefined) {
      tecnicos = this.incidente_seleccionado.tecnicos;
    } else {
      tecnicos = [];
    }
    tecnicos.push({
      nombre: this.afAuth.auth.currentUser.displayName,
      time: new Date().getTime()
    });


    const dbf = this.db;

    // Get a new write batch
    const batch = dbf.firestore.batch();

    // Poner la informacion del incidente
    const incRef = dbf.firestore.collection('incidentes').doc('incidente' + folio);
    let incidenteData;
    if (this.incidente_seleccionado.estatus === 0) {
      incidenteData = {
        'tecnicos': tecnicos,
        'estatus': 1,
        progreso: {
          0: false,
          1: true,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false
        }
      };
    } else {
      incidenteData = {
        'tecnicos': tecnicos
      };
    }

    // Poner la informacion del progreso
    const progresoRef = dbf.firestore.collection('incidentes').doc('incidente' + folio).collection('progreso').doc();
    const progresoData = {
      mensaje: null,
      nombre: this.afAuth.auth.currentUser.displayName,
      progreso: 1,
      timestamp: new Date().getTime()
    };

    batch.update(incRef, incidenteData);
    batch.set(progresoRef, progresoData);

    batch.commit().then(function () {
      toast.text = 'El incidente ' + folio + ' ha sido tomado correctamente.';
      toast.open();
      dialog.close();
      aceptar.disabled = false;
      cancelar.disabled = false;
    }).catch(function (error) {
      toast.text = 'Ha ocurrido un problema al intentar tomar el incidente... intentalo nuevamente';
      toast.open();
      dialog.close();
      aceptar.disabled = false;
      cancelar.disabled = false;
    });

  }

  incidenteTomado(displayName) {
    if (this.incidente_seleccionado.tecnicos !== undefined) {
      let encontrado = false;
      for (let x = 0; x < this.incidente_seleccionado.tecnicos.length; x++) {
        if (this.incidente_seleccionado.tecnicos[x].nombre === displayName) {
          encontrado = true;
        } else if (this.incidente_seleccionado.tecnicos[x].nombre.includes(displayName)) {
          encontrado = true;
        }
      }
      return encontrado;
    } else {
      return false;
    }
  }

  cambiarAsignado(checkbox) {
    if (checkbox.checked) {
      let encontrado = false;
      for (let x = 0; x < this.listaAsignados.length; x++) {
        if (this.listaAsignados[x].nombre === checkbox.textContent.trim()) {
          encontrado = true;
        }
      }
      if (!encontrado) {
        this.listaAsignados.push({
          nombre: checkbox.textContent.trim(),
          time: new Date().getTime()
        });
      }
    } else {
      for (let x = 0; x < this.listaAsignados.length; x++) {
        if (this.listaAsignados[x].nombre === checkbox.textContent.trim()) {
          this.listaAsignados.splice(x, 1);
          break;
        }
      }
    }
  }

  asignarTecnicos(dialog, toast, botonAceptar) {
    botonAceptar.disabled = true;
    toast.text = 'Asignando técnicos...';
    toast.open();


    const folio = this.incidente_seleccionado.folio;
    const tecnicos = this.listaAsignados.slice();
    const dbf = this.db;

    // Get a new write batch
    const batch = dbf.firestore.batch();
    let nombres = '';
    for (let x = 0; x < tecnicos.length; x++) {

      if (this.incidente_seleccionado.tecnicos !== undefined) {
        let encontrado = false;
        for (let index = 0; index < this.incidente_seleccionado.tecnicos.length; index++) {
          if (this.incidente_seleccionado.tecnicos[index].nombre === tecnicos[x].nombre) {
            encontrado = true;
          }
        }

        if (!encontrado) {
          if (nombres === '') {
            nombres += tecnicos[x].nombre;
          } else {
            nombres += ', ' + tecnicos[x].nombre;
          }
        }
      } else {
        if (x === 0) {
          nombres += tecnicos[x].nombre;
        } else {
          nombres += ', ' + tecnicos[x].nombre;
        }
      }
    }

    if (nombres === '') {
      botonAceptar.disabled = false;
      toast.text = 'Selecciona por lo menos un técnico...';
      toast.open();
      return;
    }

    // Poner la informacion del incidente
    const incRef = dbf.firestore.collection('incidentes').doc('incidente' + folio);
    let incidenteData;
    if (this.incidente_seleccionado.estatus === 0) {
      incidenteData = {
        'tecnicos': tecnicos,
        'estatus': 6,
        progreso: {
          0: false,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: true
        }
      };
    } else {
      incidenteData = {
        'tecnicos': tecnicos
      };
    }

    // Poner la informacion del progreso
    const progresoRef = dbf.firestore.collection('incidentes').doc('incidente' + folio).collection('progreso').doc();
    const progresoData = {
      mensaje: null,
      nombre: this.afAuth.auth.currentUser.displayName,
      quienes: nombres,
      progreso: 6,
      timestamp: new Date().getTime()
    };

    batch.update(incRef, incidenteData);
    batch.set(progresoRef, progresoData);

    batch.commit().then(function () {
      toast.text = 'Los técnicos han sido asignados correctamente.';
      toast.open();
      dialog.close();
      botonAceptar.disabled = false;
    }).catch(function (error) {
      toast.text = 'Ha ocurrido un problema al intentar asignar los técnicos... intentalo nuevamente';
      toast.open();
      dialog.close();
      botonAceptar.disabled = false;
    });

  }

  presionarBoton(botonEnviar) {
    if (botonEnviar.disabled === true) {
      return;
    } else {
      botonEnviar.click();
    }
  }

  enviarProgreso(input, botonEnviar, chip, toast, chip_label) {
    console.log('Enviar progreso');
    botonEnviar.disabled = true;
    if (input.value === undefined) {
      input.invalid = true;
      botonEnviar.disabled = false;
    } else if (input.value.trim() === '') {
      input.invalid = true;
      botonEnviar.disabled = false;
    } else {

      // CAMBIO DE PROGRESO CORRECTO
      input.invalid = false;

      // REFERENCIA A BASE DE DATOS Y CREACION DEL BATCH
      const batch = this.db.firestore.batch();

      const folio = this.incidente_seleccionado.folio;
      const progresoRef = this.db.firestore.collection('incidentes').doc('incidente' + folio).collection('progreso').doc();
      const incRef = this.db.firestore.collection('incidentes').doc('incidente' + folio);

      let tipo_progreso;
      let mProgreso;
      switch (chip.textContent) {
        case 'M':
          console.log('Mensajesssss');
          tipo_progreso = -1;
          break;
        case 'P':
          tipo_progreso = 2;
          mProgreso = {
            0: false,
            1: false,
            2: true,
            3: false,
            4: false,
            5: false,
            6: false
          };
          break;
        case 'E':
          tipo_progreso = 3;
          mProgreso = {
            0: false,
            1: false,
            2: false,
            3: true,
            4: false,
            5: false,
            6: false
          };
          break;
        case 'F':
          tipo_progreso = 4;
          mProgreso = {
            0: false,
            1: false,
            2: false,
            3: false,
            4: true,
            5: false,
            6: false
          };
          break;
        case 'R':
          tipo_progreso = 5;
          mProgreso = {
            0: false,
            1: false,
            2: false,
            3: false,
            4: false,
            5: true,
            6: false
          };
          break;
      }

      // Poner la informacion del progreso
      const progresoData = {
        mensaje: input.value,
        nombre: this.afAuth.auth.currentUser.displayName,
        progreso: tipo_progreso,
        timestamp: new Date().getTime()
      };

      console.log(progresoData);

      const incidenteData = {
        'estatus': tipo_progreso === -1 ? this.incidente_seleccionado.estatus : tipo_progreso,
        'progreso': tipo_progreso === -1 ? this.incidente_seleccionado.progreso : mProgreso,
      };

      console.log(incidenteData);

      batch.set(progresoRef, progresoData);
      batch.update(incRef, incidenteData);

      batch.commit().then(function () {
        input.value = '';
        switch (chip.textContent) {
          case 'M':
            toast.text = 'El mensaje ha sido enviado correctamente.';
            break;
          default:
            toast.text = 'El progreso ha sido modificado correctamente.';
            break;
        }
        toast.open();
        botonEnviar.disabled = false;
        chip.textContent = 'M';
        chip_label.label = 'Mensaje';
      }).catch(function (error) {
        toast.text = 'Ha ocurrido un problema... intentalo nuevamente';
        toast.open();
        botonEnviar.disabled = false;
      });
    }
  }

  sacarNombres(lista) {
    let nombres = '';
    for (let i = 0; i < lista.length; i++) {
      if (i === 0) {
        nombres += lista[i].nombre;
      } else {
        nombres += ', ' + lista[i].nombre;
      }
    }
    return nombres;
  }

  ngOnInit(): void {
    this.presionado = false;
    this.msg.getPermission();
    this.user = this.afAuth.authState;
    this.user.subscribe(auth => {
      if (auth !== null) {
        this.nombreLogeo = auth.displayName;
        this.cambioPagina(this.descargarIncidentes(auth.email));
        if (this.descargarIncidentes(auth.email) === 0) {
          this.clientes = this.db.collection('clientes').snapshotChanges().map(actions => {
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
        }
      }
      if (this.nombreLogeo === undefined) {
        this.dialogIniciarSesion.nativeElement.open();
      }
    });
  }

  puedeResgistrarEnBelenes(mail) {
    return mail === 'eduardo.solano@redudg.udg.mx' || mail === 'idania.gomez@csh.udg.mx' || mail === 'elba.moralesg@csh.udg.mx' ||
      mail === 'alberto.franco@csh.udg.mx' || mail === 'jorge.plascencia@redudg.udg.mx' || mail === 'jose.crubio@csh.udg.mx';
  }

  checked_belenes(nombre) {
    if (nombre.includes('Mario') || nombre.includes('Jorge')) {
      this.textoBelenes = 'Belenes - ';
      return true;
    }
    return false;
  }

  reemplazarTexto(mensaje) {
    return mensaje.replace('<tachado>', '');
  }

  buscarIndice(i) {
    if (i.folio === this.incidente_seleccionado.folio) {
      return true;
    } else {
      return false;
    }
  }

  buscarEvento(busqueda) {
    console.log(busqueda);
    if (busqueda !== undefined) {
      if (busqueda.toString().trim() !== '') {
        this.busqueda = busqueda.toLowerCase().trim();
      }
    }
    console.log(this.busqueda);
  }

  limpiarBusqueda() {
    this.busqueda = '';
  }

  compartir(inputCompartir, botonEnviar, toastBienvenido, dialogCompartirIncidente) {

    console.log('Enviar progreso');
    botonEnviar.disabled = true;

    let tip_incidente;
    if (!this.textoTipoIncidenteReal.includes('Selecciona el tipo de incidente')) {

      let s_areas2;
      if (this.incidente_seleccionado.tipoDeIncidente.includes('|')) {
        s_areas2 = this.incidente_seleccionado.tipoDeIncidente.split(' | ');
        for (const s of s_areas2) {
          if (s.trim() === this.textoTipoIncidenteReal.trim()) {
            tip_incidente = this.incidente_seleccionado.tipoDeIncidente;
            toastBienvenido.text =
              'El incidente ya fue compartido con el área seleccionada... Selecciona un área valida para compartir el incidente';
            toastBienvenido.open();
            botonEnviar.disabled = false;
            return;
          }
        }
        tip_incidente = this.incidente_seleccionado.tipoDeIncidente + ' | ' + this.textoTipoIncidenteReal;
      } else {
        if (this.incidente_seleccionado.tipoDeIncidente.trim() === this.textoTipoIncidenteReal.trim()) {
          tip_incidente = this.incidente_seleccionado.tipoDeIncidente;
          toastBienvenido.text =
            'El incidente ya fue compartido con el área seleccionada... Selecciona un área valida para compartir el incidente';
          toastBienvenido.open();
          botonEnviar.disabled = false;
          return;
        } else {
          tip_incidente = this.incidente_seleccionado.tipoDeIncidente + ' | ' + this.textoTipoIncidenteReal;
        }
      }
    } else {
      toastBienvenido.text = 'Selecciona un área para compartir el incidente';
      toastBienvenido.open();
      botonEnviar.disabled = false;
      return;
    }


    if (tip_incidente.includes('|') && tip_incidente !== this.incidente_seleccionado.tipoDeIncidente) {
      let b_taller = false;
      let b_redes = false;
      let b_multimedia = false;
      let b_belenes = false;
      const s_areas = tip_incidente.split(' | ');

      for (const s of s_areas) {
        if (s.includes('Taller de computo -') && !s.includes('Belenes')) {
          b_taller = true;
        }
        if (s.includes('Redes y telefonía -') && !s.includes('Belenes')) {
          b_redes = true;
        }
        if (s.includes('Multimedia - ') && !s.includes('Belenes')) {
          b_multimedia = true;
        }
        if (s.includes('Belenes')) {
          b_belenes = true;
        }
      }

      const areas = {
        taller: b_taller,
        redes: b_redes,
        multimedia: b_multimedia,
        belenes: b_belenes
      };

      if (inputCompartir.value === undefined) {
        inputCompartir
          .invalid = true;
        botonEnviar
          .disabled = false;
      } else if (inputCompartir.value.trim() === '') {
        inputCompartir.invalid = true;
        botonEnviar.disabled = false;
      } else {

        // CAMBIO DE PROGRESO CORRECTO
        inputCompartir.invalid = false;

        // REFERENCIA A BASE DE DATOS Y CREACION DEL BATCH
        const batch = this.db.firestore.batch();

        const folio = this.incidente_seleccionado.folio;
        const progresoRef = this.db.firestore.collection('incidentes').doc('incidente' + folio).collection('progreso').doc();
        const incRef = this.db.firestore.collection('incidentes').doc('incidente' + folio);

        const tipo_progreso = 8;
        const mProgreso = {
          0: false,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: true
        };

        const nueva_area = this.textoTipoIncidenteReal;

        // Poner la informacion del progreso
        const progresoData = {
          mensaje: inputCompartir.value,
          nombre: this.afAuth.auth.currentUser.displayName,
          progreso: tipo_progreso,
          timestamp: new Date().getTime(),
          area: nueva_area
        };

        console.log(progresoData);

        const incidenteData = {
          'estatus': tipo_progreso,
          'progreso': mProgreso,
          'tipoDeIncidente': tip_incidente,
          'areas': areas
        };

        batch.set(progresoRef, progresoData);
        batch.update(incRef, incidenteData);

        batch.commit().then(function () {
          inputCompartir.value = '';
          toastBienvenido.text = 'El incidente ha sido compartido correctamente.';
          dialogCompartirIncidente.close();
          toastBienvenido.open();
          botonEnviar.disabled = false;
        }).catch(function (error) {
          toastBienvenido.text = 'Ha ocurrido un problema... intentalo nuevamente';
          dialogCompartirIncidente.close();
          toastBienvenido.open();
          botonEnviar.disabled = false;
        });
      }
    } else {
      toastBienvenido.text = 'Selecciona un área valida para compartir el incidente';
      toastBienvenido.open();
      botonEnviar.disabled = false;
      return;
    }
  }
}
