import { TapGestureHandler, PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View, Button } from 'react-native';
import Animated, {
  Easing, /*Da una serie de funciones predefinidas que facilitan la creación de transiciones 
  suaves entre los valores animados. Las funciones controlan cómo se acelera o ralentiza la 
  animación durante el tiempo, creando efectos de animación más naturales y realistas.*/
  useAnimatedStyle, /*Define el estilo de un componente animado. Vincula un valor animado a los 
  estilos de un componente, actualizado el estilo automáticamente cuando el valor animado cambie. 
  Permite crear animaciones interactivas y dinámicas en tiempo real.*/
  useSharedValue, /*Es un hook para crear y gestionar un valor compartido entre diferentes 
  componentes y animaciones. Los valores compartidos son reactivos: cuando se actualiza un valor
  compartido, automáticamente se disparan las animaciones que dependen de él. Se usa para sincronizar
  animaciones entre varios componentes.*/
  withTiming, /*Función que envuelve un valor animado y crea una animación temporal que va desde el
  valor actual hasta un valor objetivo específico. Esta función permite controlar la duración, el
  retraso y la función de interpolación utilizada durante la animación. Se utiliza comúnmente para
  animaciones lineales y básicas, dando un efecto de fluidez en el movimiento.*/
  withSpring,/*Función similar a withTiming, para crear animaciones con efecto de rebote. Aplica 
  un efecto resorte a la animación, dando como resultado una transición más suave y natural. Puede
  controlar la rigidez del resorte, la fricción y la velocidad de desplazamiento.*/
  withRepeat, /*función que hace repetir una animación determinado número de veces o de infinita. 
  Puedes establecer el número de repeticiones y también controlar si la animación debe oscilar hacia
  adelante y hacia atrás o reiniciar desde el principio después de cada repetición.*/
  withSequence,/*permite crear una secuencia de animaciones. Se utiliza para encadenar varias 
  animaciones y ejecutarlas en orden secuencial.*/
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

export default function App() {
  function SharedValues() {
    const randomWidth = useSharedValue(10);
    const config = {
      duration: 500,
      easing: Easing.bezier(0.5, 0.01, 0, 1),
    };

    const myStyle = useAnimatedStyle(() => {
      return {
        width: withTiming(randomWidth.value, config)
      }
    });

    return (
      <>
        <Text style={styles.title}> Shared values </Text>
        <Animated.View style={[{ height: 30, backgroundColor: '#4682b4' }, myStyle]} />
        <Button
          title="toggle"
          onPress={() => {
            randomWidth.value = Math.random() * 350;
          }} />
      </>
    )
  }

  function Box() {
    const offset = useSharedValue(0);
    const animatedStyles = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: withSpring(offset.value * 300, {
              damping: 40, //velocidad inicial del cuadro
              stiffnes: 90,//distancia a recorrer
            }),
          }
        ],
      };
    });
    const CustomSpringStyles = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: withSpring(offset.value * 300, {
              damping: 40,
              stiffness: 90,
            }),
          },
          {
            rotate: `${offset.value * 350}deg`,/*A mayor número, mayor es la inclinación del cubo, 
            haciendo que gire sobre sí mismo en vez de inclinarse. También, cuanto mayor distancia 
            recorre, más giros realiza*/
          },
        ],
      };
    });

    return (
      <>
        <Text style={styles.title}>Default spring</Text>
        <Animated.View style={[styles.box, animatedStyles]} />
        <Text style={styles.title}>Custom spring</Text>
        <Animated.View style={[styles.box, CustomSpringStyles]} />
        <Button onPress={() => offset.value = withSpring(Math.random())} title="Move" />
      </>
    )
  }

  function WoobleExample() {
    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotateZ: `${rotation.value}deg` }],
      }
    });

    return (
      <>
        <Text style={styles.title}>Modifiers</Text>
        <View style={{ flexDirection: 'row' }}>
          <Animated.View style={[styles.box, { backgroundColor: `#f29339` }, animatedStyle]} />
          <Animated.View style={[styles.box, { backgroundColor: `#181818` }, animatedStyle]} />
          <Animated.View style={[styles.box, { backgroundColor: `#fb607f` }, animatedStyle]} />
        </View>
        <Button
          title="Wooble"
          onPress={() => {
            //rotation.value = withRepeat(withTiming(40), 6, true);
            /*withRepeat(withTiming(grados de inclinación), (16 = número de veces que hace el recorrido
            de ida + vuelta, en total 8 veces hará ida y vuelta),(true = ida y vuelta/ false=gira
            num veces hacia la derecha con la inclinación que le decimos y por cada ida, 
            se resetea en la posición inicial)) */

            rotation.value = withSequence(
              withTiming(-10, { duration: 50 }),//valor negativo de la rotación para que empiece más atrás
              withRepeat(withTiming(25, { duration: 100 }), 6, true),
              withTiming(0, { duration: 50 })//el valor en el que se quiere que termine el movimiento.
            )
          }}
        />

      </>
    );
  }

  function EventsExample() {
    const startingPosition = 100;
    const x = useSharedValue(startingPosition);
    const y = useSharedValue(startingPosition);

    const pressed = useSharedValue(false);
    const pressed2 = useSharedValue(false);

    const eventHandler = useAnimatedGestureHandler({
      onStart: (event, ctx) => {
        pressed.value = true;
      },
      onEnd: (event, ctx) => {
        pressed.value = false;
      }
    })

    const eventHandler2 = useAnimatedGestureHandler({
      onStart: (event, ctx) => {
        pressed2.value = true;
        ctx.startX = x.value;
        ctx.startY = y.value;
      },
      onActive: (event, ctx) => {
        x.value = ctx.startX + event.translationX;
        y.value = ctx.startY + event.translationY;
      },
      onEnd: (event, ctx) => {
        pressed2.value = false;
        //Para hacer que la pelota vuelva a su origen {
        x.value = withSpring(startingPosition);
        y.value = withSpring(startingPosition);
        //}
      }
    })

    const uas = useAnimatedStyle(() => {
      return {
        backgroundColor: pressed.value ? '#181818' : 'grey',
        transform: [{ scale: withSpring(pressed.value ? 2 : 1) }],
      };
    });

    const uas2 = useAnimatedStyle(() => {
      return {
        backgroundColor: pressed2.value ? '#FEEF86' : '#001972',
        transform: [{ translateX: x.value }, { translateY: y.value }],
      };
    });

    return (
      <GestureHandlerRootView>
        <View style={{ paddingBottom: 300 }}>
          <Text style={styles.title}>Events</Text>
          <TapGestureHandler onGestureEvent={eventHandler}>
            <Animated.View style={[styles.ball, uas]} />
          </TapGestureHandler>
          <Text style={styles.title}>Continuos Gestures</Text>
          <PanGestureHandler onGestureEvent={eventHandler2}>
            <Animated.View style={[styles.ball, uas2]} />
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    )
  }


  return (
    <View style={styles.container}>
      <SharedValues />
      <Box />
      <WoobleExample />
      <EventsExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    paddingTop: 50,
    marginHorizontal: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  box: {
    height: 80,
    width: 80,
    backgroundColor: '#8009D4',
    borderRadius: 10
  },
  ball: {
    height: 40,
    width: 40,
    backgroundColor: '#f29339',
    borderRadius: 20,
    marginVertical: 10,
  },
});
